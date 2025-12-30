const mongoose = require('mongoose')

const CharacterSchema = new mongoose.Schema({
   name: { type: String, required: true },
   imageUrl: { type: String, default: '' },

   campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

   type: { type: String, enum: ['pc', 'npc', 'doc', 'structure'], default: 'pc' },
   folder: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryFolder', default: null },

   sheet: { type: Object, default: {} },
   content: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Character', CharacterSchema)