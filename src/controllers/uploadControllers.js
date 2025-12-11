require('dotenv').config()

exports.uploadImage = (req, res) => {
   try {
      if (!req.file) {
         return res.status(400).json({ message: 'Nenhum arquivo enviado.' })
      }

      const ALLOWED_FOLDERS = ['tokens', 'images', 'videos']
      const folder = req.params.folder
      if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
         folder = 'misc'
      }
      const baseUrl = `http://localhost:${process.env.PORT}`
      const fileUrl = `${baseUrl}/uploads/${folder}/${req.file.filename}`

      res.json({
         message: 'Upload realizado com sucesso!',
         url: fileUrl
      })
   } catch (error) {
      console.error("Erro no controller de upload:", error)
      res.status(500).json({ message: 'Erro interno ao processar imagem.' })
   }
}