// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require models
const Record = require('../../models/record')
const Category = require('../../models/category')

// Set up routes of homepage
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id
    const dateSet = new Set()
    let totalAmount = 0
    // Find all categories to render category filter,
    // and find all records of the user to render record list
    const [records, categories] = await Promise.all([
      Record.find({ userId }).lean().sort({ date: 'desc' }).exec(),
      Category.find().lean().exec(),
    ])

    // Iterate over records
    records.forEach(record => {
      // Calculate total amount
      totalAmount += record.amount
      // Store month of the record to dateSet to render month filter
      dateSet.add(record.date.slice(0, 7))
    })

    // Format total amount
    totalAmount = new Intl.NumberFormat().format(totalAmount)

    return res.render('index', {
      records,
      totalAmount,
      categoryList: categories,
      dateSet,
    })
  } catch (err) {
    console.warn(err)
  }
})

// Export
module.exports = router
