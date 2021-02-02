// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require modules
const home = require('./modules/home')
const records = require('./modules/records')

// Direct to modules
router.use('/', home)
router.use('/records', records)

// Export
module.exports = router
