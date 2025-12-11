const express = require('express')
const router = express.Router()
const campaignController = require('../controllers/campaignController')

const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/', campaignController.createCampaign)
router.get('/', campaignController.getUserCampaigns)
router.get('/:id', campaignController.getCampaignById)

router.get('/:id/invite', campaignController.getInviteCode);
router.post('/:id/invite/refresh', campaignController.refreshInviteCode);
router.post('/join', campaignController.joinCampaign)

module.exports = router