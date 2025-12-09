const mongoose = require('mongoose')

const ExitSchema = new mongoose.Schema({
   side: { type: String, enum: ['top', 'bottom', 'left', 'right'], equired: true },
   offset: { type: Number, default: 0 },
   size: { type: Number, default: 1 },
   socket: { type: String, default: 'standard' }
}, { _id: false })

const TileDefinitionSchema = new mongoose.Schema({
   id: { type: String, required: true },
   src: { type: String, required: true },

   width: { type: Number, default: 1 },
   height: { type: Number, default: 1 },

   exits: [ExitSchema],

   weight: { type: Number, default: 1 }
})

const TilesetSchema = new mongoose.Schema({
   theme: { type: String, required: true, unique: true },
   tiles: [TileDefinitionSchema]
}, { _id: false })

module.exports = mongoose.model('Tileset', TilesetSchema)