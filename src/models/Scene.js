const mongoose = require('mongoose')

const SceneSchema = new mongoose.Schema({
   campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true
   },
   title: { type: String, required: true },

   type: {
      type: String,
      enum: ['static', 'procedural'],
      default: 'static'
   },
   imageUrl: { type: String },
   proceduralSettings: {
      algorithm: { type: String, default: 'drunkard_walk' },
      theme: { type: String, default: 'backrooms_lvl0' },
      seed: { type: Number },
      width: { type: Number, default: 50 },
      heigth: { type: Number, default: 50 }
   },

   gridState: { type: mongoose.Schema.Types.Mixed, default: [] },
   tokens: [{
      characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
      x: Number,
      y: Number,
      layer: { type: String, default: 'token' }
   }],
})

module.exports = mongoose.model('Scene', SceneSchema)