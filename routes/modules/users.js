// Require Express and Express router
const express = require('express')
const router = express.Router()
const passport = require('passport')

const User = require('../../models/user')

// Define routes
// Login
router.get('/login', (req, res) => {
  res.render('login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
  })
)

// Register
router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  // Get form data
  const { name, email, password, confirmPassword } = req.body

  // Check if email already exists
  User.findOne({ email }).then(user => {
    if (user) {
      console.log('The email has already been used!')
      return res.render('register', {
        name,
        email,
        password,
        confirmPassword,
      })
    }
    // Check if password and confirmPassword are the same
    if (password !== confirmPassword) {
      console.log('Password and confirmPassword do not match. ')
      return res.render('register', {
        name,
        email,
        password,
        confirmPassword,
      })
    }
    // save to User model
    return User.create({ name, email, password })
      .then(() => {
        res.redirect('/users/login')
      })
      .catch(err => console.log(err))
  })
})

// Logout
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/users/login')
})

// Export router
module.exports = router
