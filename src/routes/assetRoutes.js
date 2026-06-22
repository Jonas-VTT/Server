const express = require('express')
const router = express.Router()
const assetController = require('../controllers/assetController')
const upload = require('../config/upload')

router.post('/folders', assetController.createFolder)
router.get('/folders/:campaignId', assetController.getFolders)
router.delete('/folders/:id', assetController.deleteFolder)

router.post('/', upload.single('file'), assetController.uploadAsset)
router.get('/:campaignId', assetController.getAssets)
router.delete('/:id', assetController.deleteAsset)
router.put('/:id', upload.single('file'), assetController.updateAsset)

module.exports = router