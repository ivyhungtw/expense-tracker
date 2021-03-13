// Require packages
const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const routes = require('./routes')
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

// Set up body-parser
app.use(bodyParser.urlencoded({ extended: true }))

// Set up method-override
app.use(methodOverride('_method'))

// Set up static file
app.use(express.static('public'))

// Direct request to routes/index.js
app.use(routes)

// Start and listen on the Express server
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
