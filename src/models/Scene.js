const mongoose = require('mongoose')

const WallSchema = new mongoose.Schema({
   p1: { x: Number, y: Number },
   p2: { x: Number, y: Number },
   type: { type: String, enum: ['wall', 'door', 'window', 'invisible'], default: 'wall' },
   isOpen: { type: Boolean, default: false }
}, { _id: false })

const LightSchema = new mongoose.Schema({
   x: { type: Number, required: true },
   y: { type: Number, required: true },
   color: { type: String, default: '#ffcc00' },
   intensity: { type: Number, default: 0.5 },
   radius: { type: Number, default: 300 },
   flickerSpeed: { type: Number, default: 0 }
}, { _id: true })

const SceneSchema = new mongoose.Schema({
   campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
   name: { type: String, required: true, trim: true },
   isActive: { type: Boolean, default: false },

   type: { type: String, enum: ['map', 'image', 'video'], required: true },

   // =========================================================
   // CONFIGURAÇÃO VISUAL (Para quando type = 'image' ou 'video')
   // =========================================================

   media: {
      url: String,
      loop: { type: Boolean, default: true },
      muted: { type: Boolean, default: false },
      objectFit: { type: String, default: 'cover', enum: ['cover', 'contain'] }
   },

   mapConfig: {
      mode: { type: String, enum: ['static', 'procedural'], default: 'static' },

      procedural: {
         theme: { type: String, default: 'default' },
         algorithm: { type: String, default: 'random_growth' },
         dangerLevel: { type: Number, default: 1, min: 1, max: 5 }
      },

      gridSize: { type: Number, default: 70 },
      gridColor: { type: String, default: '#000000' },
      gridOpacity: { type: Number, default: 0.3 },

      globalLight: { type: Boolean, default: false },
      visionType: { type: String, default: 'hard', enum: ['soft', 'hard'] },
      ambientColor: { type: String, default: '#050505' },

      currentTension: { type: Number, default: 0 }
   },

   tiles: [TileSchema],

   walls: [WallSchema],
   lights: [LightSchema],

   tokens: [{
      characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
      x: Number,
      y: Number,
      size: { type: Number, default: 1 },
      layer: { type: String, default: 'token' }
   }]
}, { timestamp: true })

SceneSchema.index({ campaign: 1, isActive: 1 })

module.exports = mongoose.model('Scene', SceneSchema)