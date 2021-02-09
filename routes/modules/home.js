// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require Record model
const Record = require('../../models/record')

// Require category list
const categoryList = require('../../models/seeds/categories.json').results

// Set up routes of homepage
router.get('/', (req, res) => {
  Record.find()
    .lean()
    .then(records => {
      let totalAmount = 0
      records.forEach(record => {
        totalAmount += record.amount
      })
      totalAmount = new Intl.NumberFormat().format(totalAmount)
      res.render('index', { records, totalAmount, categoryList })
    })
    .catch(error => console.log(error))
})

// Export
module.exports = router
