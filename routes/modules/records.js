// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require Record model
const Record = require('../../models/record')

// Set up routes
router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/', (req, res) => {
  const { name, category, amount } = req.body
  Record.create({ name, category, amount })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// Export router
module.exports = router
