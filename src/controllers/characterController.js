const fs = require('fs')
const path = require('path')
const Character = require('../models/Character')
const Campaign = require('../models/Campaign')

const SHEET_TEMPLATES = {
   'ordem-paranormal': {
      nivel: 1,
      nex: 0,
      origem: 'origem',
      classe: 'classe',
      trilha: 'trilha',

      atributos: { agilidade: 1, forca: 1, intelecto: 1, presenca: 1, vigor: 1 },

      pv: { atual: 1, max: 1 },
      san: { atual: 1, max: 1 },
      pe: { atual: 1, max: 1 },

      defesa: {
         equipamento: 0,
         outros: 0,
         bloqueio: 0,
         esquiva: 0
      },
      deslocamento: '9m',

      pericias: {},
      habilidades: {},
      inventario: [],
      rituais: []
   },
   'default': {
      notes: 'Sistema desconhecido'
   }
}

exports.createCharacter = async (req, res) => {
   try {
      const { campaignId, name, type, folder } = req.body
      const userId = req.user.id

      const campaign = await Campaign.findById(campaignId)
      if (!campaign) {
         return res.status(404).json({ message: 'Campanha não encontrada' })
      }

      const systemKey = campaign.system ? campaign.system.toLowerCase().replace(/ /g, '-') : 'default'
      const initialSheet = SHEET_TEMPLATES[systemKey] || SHEET_TEMPLATES['default']

      const newCharacter = await Character.create({
         name: name || 'Novo personagem',

         type: type || 'pc',
         folder: folder || null,

         imageUrl: 'https://placehold.co/100x100?text=Token',
         campaign: campaignId,
         owner: userId,
         sheet: initialSheet
      })

      const populatedCharacter = await Character.findById(newCharacter._id)
         .populate('owner', 'name email')
         .populate('sharedWith', 'name email')

      res.status(201).json(populatedCharacter)
   }
   catch (error) {
      console.error('Erro ao criar personagem:', error)
      res.status(500).json({ message: 'Erro ao criar personagem' })
   }
}
exports.getMyCharacters = async (req, res) => {
   try {
      const { campaignId } = req.params
      const campaign = await Campaign.findById(campaignId)
      if (!campaign) return res.status(404).json({ message: "Campanha não encontrada" })
      const userId = req.user.id
      const isMaster = campaign.master.toString() === userId

      let filter = { campaign: campaignId }
      if (isMaster) {
         filter = { campaign: campaignId }
      }
      else {
         filter = {
            campaign: campaignId,
            $or: [{ owner: userId }, { sharedWith: userId }]
         }
      }
      const characters = await Character.find(filter)
         .populate('owner', 'name email')
         .populate('sharedWith', 'name email')
      res.json(characters)
   }
   catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erro ao buscar personagens' })
   }
}
exports.getCharacter = async (req, res) => {
   try {
      const { id } = req.params

      const character = await Character.findById(id)

      if (!character) {
         return res.status(404).json({ message: 'Personagem não encontrado' })
      }

      res.json(character)
   }
   catch (error) {
      console.error("Erro ao buscar personagem:", error)
      res.status(500).json({ message: 'Erro ao buscar dados do personagem' })
   }
}
exports.updateCharacter = async (req, res) => {
   try {
      const { id } = req.params
      const userId = req.user.id

      const updates = { ...req.body }
      delete updates._id
      delete updates.owner
      delete updates.campaign
      delete updates.createdAt
      delete updates.updatedAt
      delete updates.__v

      const oldChar = await Character.findById(id).populate('campaign')
      if (!oldChar) {
         return res.status(404).json({ message: 'Personagem não encontrado' })
      }

      const isOwner = oldChar.owner.toString() === userId
      const isShared = oldChar.sharedWith.includes(userId)
      const isMaster = oldChar.campaign && oldChar.campaign.master?.toString() === userId

      if (!isOwner && !isShared && !isMaster) {
         return res.status(403).json({ message: "Sem permissão para editar." })
      }

      if (updates.imageUrl && oldChar.imageUrl && updates.imageUrl !== oldChar.imageUrl) {
         if (oldChar.imageUrl.includes('/uploads/')) {
            const path = require('path')
            const fs = require('fs')
            const relativePath = oldChar.imageUrl.split('/uploads/')[1]
            const filePath = path.join(process.cwd(), 'src', 'uploads', relativePath)
            fs.unlink(filePath, (err) => { if (err) console.error("Erro apagar img:", err.message) })
         }
      }
      const updatedCharacter = await Character.findByIdAndUpdate(
         id,
         { $set: updates },
         { new: true }
      )
      if (req.io) {
         req.io.to(updatedCharacter.campaign.toString()).emit('character_updated', updatedCharacter)
      }
      res.json(updatedCharacter)
   }
   catch (error) {
      console.error("Erro update:", error)
      res.status(500).json({ message: 'Erro ao salvar' })
   }
}

exports.getShareableUsers = async (req, res) => {
   try {
      const { id } = req.params
      const currentUserId = req.user.id

      const character = await Character.findById(id)
      if (!character) {
         return res.status(404).json({ message: "Personagem não encontrado" })
      }

      if (!character.campaign) {
         return res.json([])
      }

      const campaign = await Campaign.findById(character.campaign)
         .populate('master', 'username email')
         .populate('players', 'username email')

      if (!campaign) {
         return res.status(404).json({ message: "Campanha não encontrada" })
      }

      let allUsers = []

      if (campaign.master) {
         allUsers.push(campaign.master)
      }

      if (campaign.players && campaign.players.length > 0) {
         allUsers = [...allUsers, ...campaign.players]
      }

      const uniqueUsers = allUsers.filter((user, index, self) =>
         user._id.toString() !== currentUserId &&
         index === self.findIndex((t) => t._id.toString() === user._id.toString())
      )

      res.json(uniqueUsers)

   }
   catch (error) {
      console.error("Erro ao buscar usuários para compartilhar:", error)
      res.status(500).json({ message: "Erro ao buscar lista de jogadores." })
   }
}
exports.shareCharacter = async (req, res) => {
   try {
      const { id } = req.params
      const { targetUserId } = req.body
      const userId = req.user.id

      const char = await Character.findOne({ _id: id, owner: userId })
      if (!char) return res.status(403).json({ message: "Apenas o dono pode compartilhar." })

      if (!char.sharedWith.includes(targetUserId)) {
         char.sharedWith.push(targetUserId);
         await char.save();
      }

      const updatedChar = await Character.findById(id)
         .populate('owner', 'name email')
         .populate('sharedWith', 'name email')

      res.json(updatedChar);
   } catch (error) {
      res.status(500).json({ message: "Erro ao compartilhar." })
   }
}
exports.unshareCharacter = async (req, res) => {
   try {
      const { id } = req.params
      const { userIdToRemove } = req.body
      const requesterId = req.user.id

      const char = await Character.findOne({ _id: id, owner: requesterId })
      if (!char) return res.status(403).json({ message: "Apenas o dono pode gerenciar acessos." })

      char.sharedWith = char.sharedWith.filter(uid => uid.toString() !== userIdToRemove)
      await char.save()

      const updatedChar = await Character.findById(id).populate('sharedWith', 'name email').populate('owner', 'name email')
      res.json(updatedChar)

   } catch (error) {
      res.status(500).json({ message: "Erro ao remover acesso." })
   }
}
exports.deleteCharacter = async (req, res) => {
   try {
      const { id } = req.params
      const userId = req.user.id

      const char = await Character.findById(id).populate('campaign')
      if (!char) {
         return res.status(404).json({ message: "Personagem não encontrado ou sem permissão." })
      }

      const isOwner = char.owner.toString() === userId
      const isMaster = char.campaign && char.campaign.master.toString() === userId
      if (!isOwner && !isMaster) {
         return res.status(403).json({ message: "Sem permissão para deletar." })
      }

      await Character.findByIdAndDelete(id)
      res.json({ message: "Personagem deletado com sucesso.", id: id })

   } catch (error) {
      console.error("Erro ao deletar:", error)
      res.status(500).json({ message: "Erro ao deletar personagem." })
   }
}