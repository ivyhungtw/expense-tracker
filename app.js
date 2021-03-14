// Require packages
const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const routes = require('./routes')

const usePassport = require('./config/passport')
require('./config/mongoose')

const PORT = process.env.PORT
const app = express()

// Set up template engine
app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
      eq: function (a, b) {
        return a === b
      },
    },
  })
)
app.set('view engine', 'hbs')

// Handle session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
)

// Set up body-parser
app.use(bodyParser.urlencoded({ extended: true }))

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
  next()
})

// Direct request to routes/index.js
app.use(routes)

// Start and listen on the Express server
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
