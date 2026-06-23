const mongoose = require('mongoose')

const MapLightSchema = new mongoose.Schema({
    scene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene', required: true, index: true },
    id: { type: String, required: true },

    x: { type: Number, required: true },
    y: { type: Number, required: true },

    color: { type: String, default: '#ffcc00' },
    intensity: { type: Number, default: 0.5 },
    radius: { type: Number, default: 300 },
    flickerSpeed: { type: Number, default: 0 },

    visible: { type: Boolean, default: true }
})

module.exports = mongoose.model('MapLight', MapLightSchema)