const express = require('express')
const router = express.Router()
const libraryController = require('../controllers/libraryController')

router.get('/:campaignId', libraryController.getLibraryContent)
router.post('/folders', libraryController.createFolder)
router.delete('/folders/:id', libraryController.deleteFolder)
router.put('/folders/:id', libraryController.updateFolder)

module.exports = router