// Require Express and Express router
const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const passport = require('passport')

const User = require('../../models/user')

// Define routes
// Login
router.get('/login', (req, res) => {
  res.render('login', {
    error_msg: req.flash('error'),
    email: req.session.email,
    password: req.session.password,
  })
})

router.post('/login', function (req, res, next) {
  // User passport custom callback
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      // Create error message to show on login page
      req.flash('error', info.message)
      // Store user email and password in session to show on login page
      req.session.email = req.body.email
      req.session.password = req.body.password
      return res.redirect('/users/login')
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err)
      }
      return res.redirect('/')
    })
  })(req, res, next)
})

// Register
router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const errors = []
  // Get form data
  const { name, email, password, confirmPassword } = req.body
  // Check if user already exists
  User.findOne({ email }).then(user => {
    if (user) {
      errors.push({ message: 'The email has been used.' })
    }
    // Check if password and confirmPassword are the same
    if (password !== confirmPassword) {
      errors.push({ message: 'Password and confirmPassword do not match.' })
    }
    // If the length of errors > 0, return to register page
    if (errors.length > 0) {
      return res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword,
      })
    }
    // Hash the password and create a user
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash =>
        User.create({
          name,
          email,
          password: hash,
        })
      )
      .then(() => {
        // Save registered email in session to show it on login page
        req.session.email = req.body.email
        // Create success message to show on login page
        req.flash(
          'success_msg',
          `${req.body.email} register successfully! Please login.`
        )
        res.redirect('/users/login')
      })
      .catch(err => console.log(err))
  })
})

// Logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'logout successfully!')
  // Reset email & password stored in session
  req.session.email = ''
  req.session.password = ''
  res.redirect('/users/login')
})

// Export router
module.exports = router
