const express = require('express')
const router = express.Router()
const sceneController = require('../controllers/sceneController')
const elementController = require('../controllers/elementController')

const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/', sceneController.createScene)
router.get('/campaign/:campaignId', sceneController.getScenes)
router.get('/:id', sceneController.getSceneById)
router.put('/:id', sceneController.updateScene)
router.put('/:id/activate', sceneController.activateScene)
router.delete('/:id', sceneController.deleteScene)

router.post('/folders', sceneController.createFolder)
router.get('/folders/:campaignId', sceneController.getFolders)
router.delete('/folders/:id', sceneController.deleteFolder)

router.post('/:sceneId/elements/:collectionType', elementController.addElement)
router.put('/:sceneId/elements/:collectionType/:elementId', elementController.updateElement)
router.delete('/:sceneId/elements/:collectionType/:elementId', elementController.removeElement)

module.exports = router