const Structure = require('../models/Structure')

exports.createStructure = async (req, res) => {
   try {
      const { name, width, height } = req.body
      const newStructure = await Structure.create({
         name,
         width: width || 20,
         height: height || 20,
         createdBy: req.user.id,
         elements: [],
         sockets: []
      })
      res.status(201).json(newStructure)
   } catch (error) {
      res.status(500).json({ message: "Erro ao criar estrutura" })
   }
}
exports.saveStructure = async (req, res) => {
   try {
      const { id } = req.params
      const { elements, sockets, width, height, thumbnail } = req.body
      
      const updated = await Structure.findByIdAndUpdate(id, {
         elements,
         sockets,
         width,
         height,
         thumbnail
      }, { new: true })
      
      res.json(updated)
   } catch (error) {
      res.status(500).json({ message: "Erro ao salvar estrutura" })
   }
}
exports.getStructures = async (req, res) => {
   try {
      const structures = await Structure.find({ createdBy: req.user.id })
      res.json(structures)
   } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estruturas" })
   }
}