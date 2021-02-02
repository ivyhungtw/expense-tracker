// Require mongoose
const mongoose = require('mongoose')

// Connect to database
mongoose.connect('mongodb://localhost/record-list', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Get connection status
const db = mongoose.connection
// Error
db.on('error', () => console.log('mongodb error!'))
// Success
db.once('open', () => console.log('mongodb connected!'))

// Export db
module.exports = db
