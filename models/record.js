// Require mongoose
const mongoose = require('mongoose')

// Define Schema
const Schema = mongoose.Schema
const recordSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  categoryIcon: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
})

// Create and export a model
module.exports = mongoose.model('Record', recordSchema)
