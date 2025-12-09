const mongoose = require('mongoose')

const CharacterSchema = new mongoose.Schema({
   name: {type: String, required: true},
   imageUrl: {type: String, default: ''},

   campaign: {type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true},
   owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
   sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

   sheet: {type: mongoose.Schema.Types.Mixed, default:{}}
}, {timestamps: true})

module.exports = mongoose.model('Character', CharacterSchema)