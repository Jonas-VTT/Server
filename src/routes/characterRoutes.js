const express = require('express')
const router = express.Router()
const { createCharacter, getMyCharacters, updateCharacter, shareCharacter, unshareCharacter, deleteCharacter } = require('../controllers/characterController')

const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/', createCharacter)
router.get('/my/:campaignId', getMyCharacters)
router.put('/:id', updateCharacter)
router.post('/:id/share',  shareCharacter)
router.delete('/:id/share', unshareCharacter)
router.delete('/:id', deleteCharacter)

module.exports = router