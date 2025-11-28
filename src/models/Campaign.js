const mongoose = require('mongoose')

const CampaignSchema = new mongoose.Schema({
   title: { type: String, required: true, trim: true },
   system: { type: String, required: true, enum: ['Ordem Paranormal', 'D&D 5e', 'Pathfinder 2e', 'Custom'], default: 'custom' },

   dm: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

   scenes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scene' }],
   activeScene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene' },

   createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Campaign', CampaignSchema)