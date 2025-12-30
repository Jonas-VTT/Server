const express = require('express')
const router = express.Router()
const structureController = require('../controllers/structureController')
const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/', structureController.createStructure)
router.get('/', structureController.getStructures)
router.put('/:id', structureController.saveStructure)

module.exports = router