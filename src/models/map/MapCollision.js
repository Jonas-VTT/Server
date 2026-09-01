const mongoose = require('mongoose')

const MapCollisionSchema = new mongoose.Schema({
    scene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene', required: true, index: true },
    id: { type: String, required: true },
    type: { type: String, required: true },

    layer: { type: String, enum: ['map', 'object', 'token', 'wall', 'dm'], default: 'wall' },

    p1: { x: Number, y: Number },
    p2: { x: Number, y: Number },

    type: { type: String, enum: ['wall', 'door', 'window', 'invisible'], default: 'wall' },
    isOpen: { type: Boolean, default: false }
})

module.exports = mongoose.model('MapCollision', MapCollisionSchema)