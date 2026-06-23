const mongoose = require('mongoose')

const SceneSchema = new mongoose.Schema({
   campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
   name: { type: String, required: true, trim: true },
   isActive: { type: Boolean, default: false },

   type: { type: String, enum: ['map', 'background', 'cutscene'], required: true },
   nextScene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene', default: null },
   folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },

   media: {
      url: String,
      loop: { type: Boolean, default: true },
      muted: { type: Boolean, default: false },
      objectFit: { type: String, default: 'cover', enum: ['cover', 'contain'] }
   },

   mapConfig: {
      mode: { type: String, enum: ['static', 'procedural'], default: 'static' },

      mapSize: {
         hasLimit: { type: Boolean, default: true },
         mapWidth: { type: Number, default: 30 },
         mapHeight: { type: Number, default: 20 },
      },

      gridSnap: { type: Boolean, default: true },
      gridSize: { type: Number, default: 70 },
      gridColor: { type: String, default: '#000000' },
      gridOpacity: { type: Number, default: 0.3 },
      distanceUnit: { type: String, default: 'm' },
      distanceScale: { type: Number, default: 1.5 },

      globalLight: { type: Boolean, default: false },
      visionType: { type: String, default: 'hard', enum: ['soft', 'hard'] },
      ambientColor: { type: String, default: '#050505' },
      currentTension: { type: Number, default: 0 }
   }
}, { timestamps: true })

SceneSchema.index({ campaign: 1, isActive: 1 })

module.exports = mongoose.model('Scene', SceneSchema)