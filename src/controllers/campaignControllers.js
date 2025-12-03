const Campaign = require('../models/Campaign')

exports.createCampaign = async (req, res) => {
   try {
      const { title, system, proceduralEnabled, proceduralType } = req.body

      if (!req.user) {
         return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      if (!title || !system) {
         return res.status(400).json({ message: 'Titulo e Sistema são obrigatórios' })
      }

      const newCampaign = await Campaign.create({
         title,
         system,
         mestre: req.user._id,
         players: [req.user.id],

         features: {
            proceduralMap: {
               enabled: proceduralEnabled || false,
               config: {
                  theme: proceduralType || 'none'
               }
            }
         }
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
      const campaigns = await Campaign.find({
         $or: [
            { mestre: req.user.id },
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