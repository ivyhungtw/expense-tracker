// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require models
const Record = require('../../models/record')
const Category = require('../../models/category')

// Require other packages
const moment = require('moment')

// Set up routes of homepage
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id
    const monthOfYearSet = new Set()
    let totalAmount = 0
    const [records, categoryList] = await Promise.all([
      Record.find({ userId })
        .populate('categoryId')
        .lean()
        .sort({ date: 'desc' })
        .exec(),
      Category.find().lean().exec()
    ])

    let CategoryObject = Object.assign(
      ...categoryList.map(category => ({ [category.name]: 0 }))
    )

    records.forEach(record => {
      // Calculate total amount
      totalAmount += record.amount
      CategoryObject[record.categoryId.name] += record.amount
      // Store different months of years to render year-month filter

      // Reassign date format to render record list
      const date = moment.utc(record.date)
      monthOfYearSet.add(date.format('YYYY-MM'))
      record.date = date.format('YYYY-MM-DD')
    })

    // Save months of years to session for later use
    req.session.monthOfYearSet = [...monthOfYearSet].join(' ')

    // Format total amount
    totalAmount = new Intl.NumberFormat().format(totalAmount)

    const result = await Record.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          count: {
            $sum: '$amount'
          }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ])

    let amountByMonth = {}

    result.forEach(el => {
      let date = Object.values(el._id).join('-')
      amountByMonth[date] = el.count
    })

    // Category data
    categoryList.forEach(category => {
      category.amount = CategoryObject[category.name]
    })

    return res.render('index', {
      monthOfYearSet,
      categoryList,
      totalAmount,
      records,
      indexCSS: true,
      categoryName: Object.keys(CategoryObject),
      categoryAmount: Object.values(CategoryObject),
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
