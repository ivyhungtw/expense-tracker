// Require mongoose
const mongoose = require('mongoose')

// Create variable
const MONGODB_URI = process.env.MONGODB_URI

// Connect to database
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

// Get connection status
const db = mongoose.connection
// Error
db.on('error', () => console.log('mongodb error!'))
// Success
db.once('open', () => console.log('mongodb connected!'))

// Export db
module.exports = db
