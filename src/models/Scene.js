const mongoose = require('mongoose')

const SceneElementSchema = new mongoose.Schema({
   id: { type: String, required: true },

   type: {
      type: String,
      enum: ['floor', 'object', 'wall', 'token'],
      default: 'image'
   },

   layer: {
      type: String,
      enum: ['map', 'object', 'token', 'wall', 'dm', 'fog'],
      default: 'token'
   },

   x: { type: Number, default: 0 },
   y: { type: Number, default: 0 },
   width: { type: Number, default: 100 },
   height: { type: Number, default: 100 },
   rotation: { type: Number, default: 0 },
   scaleX: { type: Number, default: 1 },
   scaleY: { type: Number, default: 1 },

   src: { type: String },

   opacity: { type: Number, default: 1 },
   visible: {
      type: Boolean,
      default: true
   },
   locked: { type: Boolean, default: false },

   points: [Number],
   shapeType: { type: String, enum: ['rect', 'poly'], default: 'rect' },
   tilesX: { type: Number, default: 1 },
   tilesY: { type: Number, default: 1 },
   stroke: String,
   strokeWidth: Number,
   fill: String,

   name: String,
   linkedCharacterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' }

}, { _id: false })

const WallSchema = new mongoose.Schema({
   id: { type: String },
   p1: { x: Number, y: Number },
   p2: { x: Number, y: Number },
   type: { type: String, enum: ['wall', 'door', 'window', 'invisible'], default: 'wall' },
   isOpen: { type: Boolean, default: false }
}, { _id: false })

const LightSchema = new mongoose.Schema({
   id: { type: String },
   x: { type: Number, required: true },
   y: { type: Number, required: true },
   color: { type: String, default: '#ffcc00' },
   intensity: { type: Number, default: 0.5 },
   radius: { type: Number, default: 300 },
   flickerSpeed: { type: Number, default: 0 }
}, { _id: false })

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

      procedural: {
         theme: { type: String, default: 'default' },
         algorithm: { type: String, default: 'random_growth' },
         dangerLevel: { type: Number, default: 1, min: 1, max: 5 }
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
   },

   //tiles: [TileSchema],

   elements: [SceneElementSchema],
   walls: [WallSchema],
   lights: [LightSchema],
}, { timestamps: true })

SceneSchema.index({ campaign: 1, isActive: 1 })

module.exports = mongoose.model('Scene', SceneSchema)