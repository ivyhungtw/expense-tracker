// Require related packages
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const bcrypt = require('bcryptjs')

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
              message: 'That email is not registered!'
            })
          }
          // Check password
          return bcrypt.compare(password, user.password).then(isMatch => {
            if (!isMatch) {
              return done(null, false, {
                message: 'Incorrect Password'
              })
            }
            return done(null, user)
          })
        })
        .catch(err => done(err, false))
    })
  )

  // Set up facebook strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK,
        profileFields: ['id', 'email', 'displayName', 'picture.type(large)']
      },
      (accessToken, refreshToken, profile, done) => {
        const { email, name, id, picture } = profile._json

        console.log('profile', profile)

        return User.findOne({ $or: [{ email }, { facebookId: id }] }).then(
          user => {
            // If user already exists in User model, return user
            if (user) {
              return done(null, user)
            }
            // If user doesn't exist, create a user and save to User model
            // because password field is required in the model,
            // we have to generate a random password for it
            const randomPassword = Math.random().toString(36).slice(-8)
            return bcrypt
              .genSalt(10)
              .then(salt => bcrypt.hash(randomPassword, salt))
              .then(hash =>
                User.create({
                  name,
                  email,
                  password: hash,
                  facebookId: id,
                  avatar: picture.data.url || `https://robohash.org/${name}`
                })
              )
              .then(user => done(null, user))
              .catch(err => console.log(err))
          }
        )
      }
    )
  )

  // Set up google strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK
      },
      function (token, tokenSecret, profile, done) {
        const { sub, name, email, picture } = profile._json
        // Check if user already exists
        User.findOne({ googleId: sub }).then(user => {
          if (user) return done(null, user)

          const randomPassword = Math.random().toString(36).slice(-8)
          bcrypt
            .genSalt(10)
            .then(salt => bcrypt.hash(randomPassword, salt))
            .then(hash =>
              User.create({
                name,
                email,
                avatar: picture || `https://robohash.org/${name}`,
                password: hash,
                googleId: sub
              })
            )
            .then(user => done(null, user))
            .catch(err => done(err, false))
        })
      }
    )
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
