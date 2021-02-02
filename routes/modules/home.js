// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require modules

// Set up routes of homepage
router.get('/', (req, res) => {
  res.render('index')
})

// Export
module.exports = router
