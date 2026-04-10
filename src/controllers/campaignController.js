const Campaign = require('../models/Campaign')
const crypto = require('crypto')

exports.createCampaign = async (req, res) => {
   try {
      const { title, system, features } = req.body

      if (!req.user) {
         return res.status(401).json({ message: 'Usuário não autenticado.' })
      }

      if (!title || !system) {
         return res.status(400).json({ message: 'Titulo e Sistema são obrigatórios' })
      }

      const newCampaign = await Campaign.create({
         title,
         system,
         master: req.user._id,
         players: [req.user.id],
         activeScene: null,

         features: features || {}
      })

      res.status(201).json(newCampaign)
   }
   catch (error) {
      console.error('Erro ao criar campanha: ', error)
      res.status(500).json({ message: 'Erro interno ao criar campanha.' })
   }
}
exports.getUserCampaigns = async (req, res) => {
   try {
      if (!req.user) return res.status(401).json({ message: "Login necessário." })

      const campaigns = await Campaign.find({
         $or: [
            { master: req.user.id },
            { players: req.user.id }
         ]
      }).sort({ createdAt: -1 })

      res.status(200).json(campaigns)
   }
   catch (error) {
      console.error('Erro ao buscar campanhas: ', error)
      res.status(500).json({ message: 'Erro ao buscar suas campanhas' })
   }
}
exports.getCampaignById = async (req, res) => {
   try {
      const campaign = await Campaign.findById(req.params.id)
         .populate('master', 'name email')
         .populate('players', 'name email')
         .populate('activeScene')

      if (!campaign) {
         return res.status(404).json({ message: 'Campanha não encontrada' })
      }

      if (!req.user) {
         return res.status(401).json({ message: "Você precisa estar logado" })
      }

      const masterId = campaign.master ? campaign.master._id.toString() : null
      const userId = req.user.id

      const ismaster = masterId === userId
      const isPlayer = campaign.players.some(p => p._id.toString() === userId)

      if (!ismaster && !isPlayer) {
         return res.status(403).json({ message: 'Você não tem acesso a esta campanha' })
      }

      res.json(campaign)
   }
   catch (error) {
      res.status(500).json({ message: 'Erro ao buscar campanha' })
   }
}
exports.getInviteCode = async (req, res) => {
   try {
      const { id } = req.params
      const userId = req.user.id

      // Verifica se é o dono
      const campaign = await Campaign.findOne({ _id: id, master: userId })
      if (!campaign) return res.status(403).json({ message: "Apenas o master pode convidar." })

      // Se não tiver código ainda, cria um agora
      if (!campaign.inviteCode) {
         campaign.inviteCode = crypto.randomBytes(4).toString('hex') // Gera algo tipo "a1b2c3d4"
         await campaign.save()
      }

      res.json({ inviteCode: campaign.inviteCode })

   } catch (error) {
      res.status(500).json({ message: "Erro ao gerar convite." })
   }
}
exports.refreshInviteCode = async (req, res) => {
   try {
      const { id } = req.params
      const userId = req.user.id

      const campaign = await Campaign.findOne({ _id: id, master: userId })
      if (!campaign) return res.status(403).json({ message: "Sem permissão." })

      // Gera um novo e substitui o antigo
      campaign.inviteCode = crypto.randomBytes(4).toString('hex')
      await campaign.save()

      res.json({ inviteCode: campaign.inviteCode })

   } catch (error) {
      res.status(500).json({ message: "Erro ao renovar convite." })
   }
}
exports.joinCampaign = async (req, res) => {
   try {
      const { inviteCode } = req.body
      const userId = req.user.id

      const campaign = await Campaign.findOne({ inviteCode })
      if (!campaign) return res.status(404).json({ message: "Convite inválido ou expirado." })

      const alreadyPlayer = campaign.players.some(p => p.toString() === userId)
      const isMaster = campaign.master.toString() === userId

      if (alreadyPlayer || isMaster) {
         return res.status(200).json({ message: "Você já está nesta campanha!", campaignId: campaign._id })
      }

      campaign.players.push(userId)
      await campaign.save()

      res.json({ message: "Bem-vindo à campanha!", campaignId: campaign._id })

   } catch (error) {
      res.status(500).json({ message: "Erro ao entrar na campanha." })
   }
}
exports.fixSchemas = async (req, res) => {
   try {
      // 1. Busca todas as campanhas que NÃO tem o campo activeScene
      const campaigns = await Campaign.find({ activeScene: { $exists: false } });

      let count = 0;
      for (const camp of campaigns) {
         // 2. Define o valor padrão (null ou cria uma cena padrão se quiser)
         camp.activeScene = null;

         // Se quiser ser chique, você poderia criar uma cena "Lobby" padrão aqui e atribuir

         await camp.save();
         count++;
      }

      res.json({ message: `Migração concluída! ${count} campanhas foram atualizadas.` });

   } catch (error) {
      res.status(500).json({ message: "Erro na migração", error });
   }
}