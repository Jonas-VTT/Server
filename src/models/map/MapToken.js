const mongoose = require('mongoose')

const MapTokenSchema = new mongoose.Schema({
    scene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene', required: true, index: true },
    id: { type: String, required: true },

    linkedCharacterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', default: null },
    name: { type: String, default: 'Desconhecido' },

    layer: { type: String, enum: ['map', 'object', 'token', 'wall', 'dm'], default: 'token' },

    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },
    rotation: { type: Number, default: 0 },
    scaleX: { type: Number, default: 1 },
    scaleY: { type: Number, default: 1 },

    src: { type: String },

    opacity: { type: Number, default: 1 },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },

    visionRadius: { type: Number, default: 0 },
    auraColor: { type: String, default: 'transparent' },
    auraRadius: { type: Number, default: 0 }
})