// Require mongoose
const mongoose = require('mongoose')

// Define Schema
const Schema = mongoose.Schema
const userSchema = new Schema({
  name: {
    required: true,
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    default: 20000
  },
  googleId: {
    type: String
  },
  facebookId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Create and export a model
module.exports = mongoose.model('User', userSchema)
