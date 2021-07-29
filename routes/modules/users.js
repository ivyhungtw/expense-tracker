const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('passport')

const { authenticator } = require('../../middleware/auth')
const userController = require('../../controllers/userController')

// Routes
router.get('/login', userController.getLoginPage)
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })
)

router.get('/register', userController.getRegisterPage)
router.post('/register', userController.register)

router.get('/logout', userController.logout)

router.get('/profile', authenticator, userController.getUserProfile)
router.get('/edit', authenticator, userController.editUserProfile)
router.put(
  '/profile',
  authenticator,
  upload.single('image'),
  userController.putUserProfile
)

router.put('/budget', authenticator, userController.putBudget)

// Export router
module.exports = router
