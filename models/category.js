// Require mongoose
const mongoose = require('mongoose')

// Define Schema
const Schema = mongoose.Schema
const categorySchema = new Schema({
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 15,
    trim: true,
    validate: {
      validator: word => word.trim().toLowerCase() !== 'all',
      message: () => 'You can not name category as "all"'
    }
  },
  icon: {
    type: String,
    required: true,
    trim: true
  }
})

// Export model
module.exports = mongoose.model('Category', categorySchema)
