const express = require('express')
const router = express.Router()
const sceneController = require('../controllers/sceneController')

const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/', sceneController.createScene)
router.get('/campaign/:campaignId', sceneController.getScenes)
router.put('/:id', sceneController.updateScene)
router.put('/:id/activate', sceneController.activateScene)
router.delete('/:id', sceneController.deleteScene)

router.post('/folders', sceneController.createFolder)
router.get('/folders/:campaignId', sceneController.getFolders)
router.delete('/folders/:id', sceneController.deleteFolder)

router.post('/:id/elements', sceneController.addElement)
router.put('/:id/elements/:elementId', sceneController.updateElement)
router.delete('/:id/elements/:elementId', sceneController.removeElement)

module.exports = router