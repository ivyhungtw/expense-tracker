const bcrypt = require('bcryptjs')
const passport = require('passport')

const User = require('../models/user')
const Record = require('../models/record')

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const uploadImg = path => {
  return new Promise((resolve, reject) => {
    imgur.upload(path, (err, img) => {
      if (err) {
        return reject(err)
      }
      resolve(img)
    })
  })
}

const userController = {
  getLoginPage: (req, res) => {
    res.render('login', {
      error_msg: req.flash('error'),
      email: req.session.email,
      password: req.session.password,
      formCSS: true
    })
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
        password: hash,
        avatar: `https://robohash.org/${name}`
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
    req.session.destroy(err => {
      if (err) {
        return console.log(err)
      }
    })
    res.redirect('/users/login')
  },
  getUserProfile: (req, res) => {
    res.render('users/profile')
  },
  editUserProfile: (req, res) => {
    res.render('users/edit')
  },
  putUserProfile: async (req, res) => {
    const { file } = req
    let img
    const acceptedType = ['.png', '.jpg', '.jpeg']

    if (!req.body.name || req.body.name.length > 25) {
      return res.render('users/edit', {
        user: { name: req.body.name },
        error_msg: 'Name can not be empty or longer than 25 characters.'
      })
    }

    try {
      if (file) {
        const fileType = file.originalname
          .substring(file.originalname.lastIndexOf('.'))
          .toLowerCase()

        if (acceptedType.indexOf(fileType) === -1) {
          req.flash(
            'error_msg',
            'This type of image is not accepted, Please upload the image ends with png, jpg, or jpeg. '
          )
          return res.redirect('back')
        }

        imgur.setClientID(IMGUR_CLIENT_ID)
        img = await uploadImg(file.path)
      }

      let user = await User.findOne({ _id: req.user._id }).exec()

      user = Object.assign(user, {
        name: req.body.name,
        avatar: file ? img.data.link : user.avatar
      })

      await user.save()

      res.redirect('/users/profile')
    } catch (err) {
      console.log(err)
    }
  },
  putBudget: async (req, res) => {
    let user = await User.findOne({ _id: req.user._id }).exec()

    user = Object.assign(user, {
      budget: req.body.budget
    })

    await user.save()
    res.redirect('back')
  },
  deleteUser: async (req, res) => {
    if (req.user && req.user.facebookId) {
      await Promise.all([
        User.deleteOne({ facebookId: req.user.facebookId }),
        Record.deleteMany({ userId: req.user.id })
      ])
      return res.redirect('/users/login')
    }
    res.redirect('back')
  }
}

module.exports = userController
