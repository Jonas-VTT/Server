const mongoose = require('mongoose')

const MapPropSchema = new mongoose.Schema({
    scene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene', required: true, index: true },
    id: { type: String, required: true },

    layer: { type: String, enum: ['map', 'object', 'token', 'wall', 'dm'], default: 'object' },

    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },
    rotation: { type: Number, default: 0 },
    scaleX: { type: Number, default: 1 },
    scaleY: { type: Number, default: 1 },

    src: { type: String, required: true },

    opacity: { type: Number, default: 1 },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false }
})

module.exports = mongoose.model('MapProp', MapPropSchema)