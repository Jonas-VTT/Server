const multer = require('multer')
const path = require('path')
const fs = require('fs')

const UPLOAD_ROOT = path.join(process.cwd(), 'src', 'uploads')
const ALLOWED_FOLDERS = ['tokens']

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      let folder = req.params.folder
      if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
         folder = 'misc'
      }

      const uploadPath = path.join(UPLOAD_ROOT, folder)
      if (!fs.existsSync(uploadPath)) {
         fs.mkdirSync(uploadPath, { recursive: true })
      }

      cb(null, uploadPath)
   },

   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + path.extname(file.originalname))
   }
})
const fileFilter = (req, file, cb) => {
   const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(new Error('Tipo de arquivo inválido.'), false);
   }
}

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: { fileSize: 1024 * 1024 * 10 }
})

module.exports = upload