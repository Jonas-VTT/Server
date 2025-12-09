const express = require('express')
const router = express.Router()

const uploadConfig = require('../config/upload')

const { uploadImage } = require('../controllers/uploadControllers')

router.post('/:folder', uploadConfig.single('file'), uploadImage)

module.exports = router