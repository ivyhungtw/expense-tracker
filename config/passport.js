// Require related packages
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Require User model
const User = require('../models/user')

// Export function
module.exports = app => {
  // Initialize Passport and restore authentication state, if any, from the session
  app.use(passport.initialize())
  app.use(passport.session())
  // Configure the local strategy for use by Passport.
  // The local strategy require a `verify` function which receives the credentials (`username` and `password`) submitted by the user.  The function must verify that the password is correct and then invoke `done` with a user object, which will be set at `req.user` in route handlers after authentication.
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ email })
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: 'That email is not registered!',
            })
          }
          if (user.password !== password) {
            return done(null, false, {
              message: 'Email or Password incorrect.',
            })
          }
          return done(null, user)
        })
        .catch(err => done(err, false))
    })
  )

  // Configure Passport authenticated session persistence.
  // In order to restore authentication state across HTTP requests, Passport needs to serialize users into and deserialize users out of the session.  The typical implementation of this is as simple as supplying the user ID when serializing, and querying the user record by ID from the database when deserializing.
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}
