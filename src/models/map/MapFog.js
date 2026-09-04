const mongoose = require('mongoose')

const MapShapeSchema = new mongoose.Schema({
    scene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene', required: true, index: true },
    id: { type: String, required: true },
    type: { type: String, required: true },

    layer: { type: String, enum: ['map', 'object', 'token', 'wall', 'dm', 'fog'], default: 'map' },
    shapeType: { type: String, enum: ['rect', 'poly'], default: 'rect' },

    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },

    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },

    points: [Number],

    opacity: { type: Number, default: 1 },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false }
})

module.exports = mongoose.model('MapShape', MapShapeSchema)