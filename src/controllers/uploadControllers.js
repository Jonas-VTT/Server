require('dotenv').config()
const { uploadToB2 } = require('../utils/b2Storage')

exports.uploadImage = (req, res) => {
   try {
      if (!req.file) {
         return res.status(400).json({ message: 'Nenhum arquivo enviado.' })
      }

      const ALLOWED_FOLDERS = ['tokens', 'images', 'videos']

      let folder = req.params.folder
      if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
         folder = 'misc'
      }

      const cloudUrl = await uploadToB2(req.file.buffer, req.file.originalname, req.file.mimetype, folder)

      res.json({
         message: 'Upload realizado com sucesso!',
         url: cloudUrl
      })
   } 
   catch (error) {
      console.error("Erro no controller de upload:", error)
      res.status(500).json({ message: 'Erro interno ao processar imagem.' })
   }
}