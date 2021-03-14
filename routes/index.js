// Require Express and Express router
const express = require('express')
const router = express.Router()

const { authenticator } = require('../middleware/auth')

// Require modules
const home = require('./modules/home')
const records = require('./modules/records')
const users = require('./modules/users')
const auth = require('./modules/auth')

// Direct to modules
router.use('/records', authenticator, records)
router.use('/users', users)
router.use('/auth', auth)
router.use('/', authenticator, home)

// Export
module.exports = router
