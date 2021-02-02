// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require Record model
const Record = require('../../models/record')

// Set up routes of homepage
router.get('/', (req, res) => {
  Record.find()
    .lean()
    .then(records => {
      let totalAmount = 0
      records.forEach(record => {
        totalAmount += record.amount
      })
      res.render('index', { records, totalAmount })
    })
    .catch(error => console.log(error))
})

// Export
module.exports = router
