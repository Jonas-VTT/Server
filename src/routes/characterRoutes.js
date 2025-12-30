const express = require('express')
const router = express.Router()
const characterController = require('../controllers/characterController')

const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/', characterController.createCharacter)
router.get('/:id', characterController.getCharacter)
router.get('/my/:campaignId', characterController.getMyCharacters)
router.put('/:id', characterController.updateCharacter)
router.get('/:id/shareable-users', characterController.getShareableUsers)
router.post('/:id/share', characterController.shareCharacter)
router.delete('/:id/share', characterController.unshareCharacter)
router.delete('/:id', characterController.deleteCharacter)

module.exports = router