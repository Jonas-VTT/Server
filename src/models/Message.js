const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  sender: { type: String, required: true },
  senderId: { type: String },
  type: { type: String, enum: ['text', 'roll'], default: 'text' },
  isBlind: { type: Boolean, default: false },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Message', MessageSchema)