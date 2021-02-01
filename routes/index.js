// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require modules
const home = require('./modules/home')

// Direct to modules
router.use('/', home)

// Export
module.exports = router
