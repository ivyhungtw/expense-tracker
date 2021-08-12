// Require packages
const express = require('express')
const session = require('express-session')
const redis = require('redis')
const client =
  process.env.NODE_ENV === 'production'
    ? redis.createClient(
        `redis://${process.env.REDIS_ENDPOINT_URI.replace(
          /^(redis\:\/\/)/,
          ''
        )}`,
        { password: process.env.REDIS_PASSWORD }
      )
    : redis.createClient()
const redisStore = require('connect-redis')(session)
const exphbs = require('express-handlebars')

const flash = require('connect-flash')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const routes = require('./routes')

const usePassport = require('./config/passport')
require('./config/mongoose')
require('./utils/handlebars-helper')

const PORT = process.env.PORT
const app = express()

// Set up template engine
app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
  })
)
app.set('view engine', 'hbs')

// Handle session
client.on('connect', function (err) {
  if (err) {
    console.log('Could not establish a connection with Redis. ' + err)
  } else {
    console.log('Connected to Redis successfully!')
  }
})

app.use(
  session({
    store: new redisStore({ client }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: true,
      secure: false,
      httpOnly: false
    }
  })
)

// Set up body-parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set up method-override
app.use(methodOverride('_method'))

// Set up static file
app.use(express.static('public'))

// Call passport function
usePassport(app)

// Use flash
app.use(flash())

// Add response local variables scoped to the request
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})

// Direct request to routes/index.js
app.use(routes)

// Start and listen on the Express server
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
