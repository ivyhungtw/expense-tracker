// Require Express and Express router
const express = require('express')
const router = express.Router()

const { authenticator } = require('../../middleware/auth')

const userController = require('../../controllers/userController')

// Routes
router.get('/login', userController.getLoginPage)
router.post('/login', userController.login)

router.get('/register', userController.getRegisterPage)
router.post('/register', userController.register)

router.get('/logout', userController.logout)

router.get('/profile', authenticator, userController.getUserProfile)
router.get('/edit', authenticator, userController.editUserProfile)

// Export router
module.exports = router
