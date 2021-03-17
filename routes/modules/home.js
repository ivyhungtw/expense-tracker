// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require models
const Record = require('../../models/record')
const Category = require('../../models/category')

// Set up routes of homepage
router.get('/', async (req, res) => {
  const userId = req.user._id
  const dateSet = new Set()
  let totalAmount = 0
  let categories
  let records

  // Find all categories to render category filter
  try {
    categories = await Category.find().lean().exec()
  } catch (err) {
    console.warn(err)
  }

  try {
    // Find all records of the user to render record list
    records = await Record.find({ userId }).lean().sort({ date: 'desc' }).exec()

    records.forEach(record => {
      // Calculate total amount
      totalAmount += record.amount
      // Store month of the record to dateSet to render month filter
      dateSet.add(record.date.slice(0, 7))
    })
    // Format total amount
    totalAmount = new Intl.NumberFormat().format(totalAmount)
  } catch (err) {
    console.warn(err)
  }

  return res.render('index', {
    records,
    totalAmount,
    categoryList: categories,
    dateSet,
  })
})

// Export
module.exports = router
