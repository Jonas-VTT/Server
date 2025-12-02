const express = require('express')
const router = express.Router()
const { createCampaign, getUserCampaigns } = require('../controllers/campaignControllers')
const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/', createCampaign)
router.get('/', getUserCampaigns)

module.exports = router