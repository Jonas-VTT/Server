const mongoose = require('mongoose')

const FolderSchema = new mongoose.Schema({
   name: { type: String, required: true, trim: true },
   campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
   parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }
})

module.exports = mongoose.model('Folder', FolderSchema)