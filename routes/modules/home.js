// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require models
const Record = require('../../models/record')
const Category = require('../../models/category')

// Require category list
const categoryList = require('../../models/seeds/categories.json').results

// Variables
let categoryData

// Set up routes of homepage
router.get('/', (req, res) => {
  const userId = req.user._id
  Category.find()
    .lean()
    .then(categories => {
      categoryData = categories
      Record.find({ userId })
        .lean()
        .then(records => {
          let totalAmount = 0
          records.forEach(record => {
            totalAmount += record.amount
          })
          totalAmount = new Intl.NumberFormat().format(totalAmount)
          res.render('index', {
            records,
            totalAmount,
            categoryList: categoryData,
          })
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

// Export
module.exports = router
