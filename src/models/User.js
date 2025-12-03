const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },

  role: {type: String, enum: ['user', 'mestre', 'admin'], default: 'user'}
})

module.exports = mongoose.model('User', UserSchema)