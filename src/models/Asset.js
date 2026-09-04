const mongoose = require('mongoose')

const AssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, default: 'image' },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetFolder', default: null },
  
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Asset', AssetSchema)