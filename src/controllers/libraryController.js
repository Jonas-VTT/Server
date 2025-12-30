const LibraryFolder = require('../models/LibraryFolder')
const Character = require('../models/Character')

exports.getLibraryContent = async (req, res) => {
   try {
      const { campaignId } = req.params
      
      const [folders, items] = await Promise.all([
         LibraryFolder.find({ campaign: campaignId }),
         Character
            .find({ campaign: campaignId })
            .select('name type folder imageUrl sheet content attributes skills inventory owner createdBy sharedWith') 
      ])

      res.json({ folders, items })
   } 
   catch (error) {
      console.error("Erro ao buscar biblioteca:", error)
      res.status(500).json({ message: "Erro ao carregar biblioteca" })
   }
}
exports.createFolder = async (req, res) => {
   try {
      const { name, campaign, parent } = req.body
      
      const folder = await LibraryFolder.create({ 
         name, 
         campaign, 
         parent: parent || null 
      })
      
      res.status(201).json(folder)
   } catch (error) {
      console.error("Erro ao criar pasta:", error)
      res.status(500).json({ message: "Erro ao criar pasta" })
   }
}
exports.deleteFolder = async (req, res) => {
   try {
      const { id } = req.params

      await Character.updateMany({ folder: id }, { folder: null })
      await LibraryFolder.deleteMany({ parent: id }) 
      await LibraryFolder.findByIdAndDelete(id)

      res.json({ message: "Pasta deletada" })
   } catch (error) {
      res.status(500).json({ message: "Erro ao deletar pasta" })
   }
}
exports.updateFolder = async (req, res) => {
   try {
      const { id } = req.params
      const { name, parent } = req.body
      const updateData = { name, parent }
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])
      
      const folder = await LibraryFolder.findByIdAndUpdate(
         id, 
         { name, parent }, 
         { new: true }
      )
      res.json(folder)
   } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar pasta" })
   }
}