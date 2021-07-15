// Require Express and Express router
const express = require('express')
const router = express.Router()

const userController = require('../../controllers/userController')

// Routes
router.get('/login', userController.getLoginPage)
router.post('/login', userController.login)

router.get('/register', userController.getRegisterPage)
router.post('/register', userController.register)

router.get('/logout', userController.logout)

// Export router
module.exports = router
