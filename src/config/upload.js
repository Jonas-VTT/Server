const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const UPLOAD_ROOT = path.join(process.cwd(), 'src', 'uploads')
const ALLOWED_FOLDERS = ['tokens', 'images', 'videos', 'misc']

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
   const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
   ]
   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } 
   else {
      cb(new Error('Tipo de arquivo inválido.'), false);
   }
}

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: { fileSize: 1024 * 1024 * 100000 }
})

module.exports = upload