const mongoose = require('mongoose')

const LibraryFolderSchema = new mongoose.Schema({
   campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
   name: { type: String, required: true },
   parent: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryFolder', default: null },
}, { timestamps: true })

module.exports = mongoose.model('LibraryFolder', LibraryFolderSchema)