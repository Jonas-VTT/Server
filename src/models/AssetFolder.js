const mongoose = require('mongoose')

const AssetFolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetFolder', default: null }, // Pasta dentro de pasta
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('AssetFolder', AssetFolderSchema)