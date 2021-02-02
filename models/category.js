// Require mongoose
const mongoose = require('mongoose')

// Define Schema
const Schema = mongoose.Schema
const categorySchema = new Schema({
  name: String,
  name_en: String,
  icon: String,
})

// Export model
module.exports = mongoose.model('Category', categorySchema)
