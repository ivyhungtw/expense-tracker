// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require models
const Record = require('../../models/record')
const Category = require('../../models/category')

// Require other packages
const moment = require('moment')

const {
  getAmountByMonth,
  getAmountByCategory,
  organizeCategoryData
} = require('../../utils/records')

// Set up routes of homepage
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id
    const filter = { userId }
    const monthOfYearSet = new Set()
    let totalAmount = 0
    const [records, categoryList, amountByMonth, amountByCategory] =
      await Promise.all([
        Record.find({ userId })
          .populate('categoryId')
          .lean()
          .sort({ date: 'desc' })
          .exec(),
        Category.find().lean().exec(),
        getAmountByMonth(filter),
        getAmountByCategory(filter)
      ])

    const categoryObject = organizeCategoryData(categoryList, amountByCategory)

    records.forEach(record => {
      // Calculate total amount
      totalAmount += record.amount

      const date = moment.utc(record.date)
      // Reassign date format to render record list
      record.date = date.format('YYYY-MM-DD')
      // Store different months of years to render year-month filter
      monthOfYearSet.add(date.format('YYYY-MM'))
    })

    // Save months of years to session for later use
    req.session.monthOfYearSet = [...monthOfYearSet].join(' ')

    // Format total amount
    totalAmount = new Intl.NumberFormat().format(totalAmount)

    return res.render('index', {
      monthOfYearSet,
      categoryList,
      totalAmount,
      records,
      indexCSS: true,
      categoryName: Object.keys(categoryObject),
      categoryAmount: Object.values(categoryObject),
      chart: true,
      groupByMonth: Object.keys(amountByMonth),
      amountByMonth: Object.values(amountByMonth),
      home: true
    })
  } catch (err) {
    console.warn(err)
  }
})

// Export
module.exports = router
