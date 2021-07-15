const bcrypt = require('bcryptjs')
const passport = require('passport')

const User = require('../models/user')

const userController = {
  getLoginPage: (req, res) => {
    res.render('login', {
      error_msg: req.flash('error'),
      email: req.session.email,
      password: req.session.password,
      formCSS: true
    })
  },
  login: (req, res, next) => {
    // Use passport custom callback
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
  },
  getRegisterPage: (req, res) => {
    res.render('register', { email: req.session.email, formCSS: true })
  },
  register: async (req, res) => {
    const errors = []
    const emailRule =
      /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
    // Get form data
    const { name, email, password, confirmPassword } = req.body
    req.session.password = ''

    // Check if all required fields are filled out
    if (!email || !password || !confirmPassword) {
      errors.push({
        message: 'Please fill out all required fields marked with *'
      })
    }
    // Check email format
    if (email.search(emailRule) === -1) {
      errors.push({ message: 'Please enter the correct email address.' })
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
        formCSS: true
      })
    }

    try {
      // After passing validation,
      // check if the email already exists in the user collection
      const user = await User.findOne({ email }).exec()
      // If user exits, redirect to register page
      if (user) {
        req.session.email = email
        req.flash(
          'warning_msg',
          'A user with this email already exists. Choose a different address or login directly.'
        )
        return res.redirect('/users/register')
      }
      // If not, generate hashed password,
      // and store user into user collection
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)
      await User.create({
        name,
        email,
        password: hash
      })

      // Save registered email in session to show it on login page
      req.session.email = email
      // Create success message to show on login page
      req.flash(
        'success_msg',
        `${req.body.email} register successfully! Please login.`
      )
      return res.redirect('/users/login')
    } catch (err) {
      console.warn(err)
      res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword,
        formCSS: true
      })
    }
  },
  logout: (req, res) => {
    req.logout()
    req.flash('success_msg', 'logout successfully!')
    // Reset email & password stored in session
    req.session.email = ''
    req.session.password = ''
    res.redirect('/users/login')
  }
}

module.exports = userController
