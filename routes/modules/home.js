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
        .sort({ date: 'desc' })
        .then(records => {
          const dateSet = new Set()
          let totalAmount = 0
          records.forEach(record => {
            // Calculate total amount
            totalAmount += record.amount
            // Store month of the record to dateSet
            dateSet.add(record.date.slice(0, 7))
          })
          // Format total amount
          totalAmount = new Intl.NumberFormat().format(totalAmount)

          res.render('index', {
            records,
            totalAmount,
            categoryList: categoryData,
            dateSet,
          })
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

// Export
module.exports = router
