// Require Record and Category model
const Record = require('../models/record')
const Category = require('../models/category')

// Require other packages
const moment = require('moment')

const {
  getAmountByMonth,
  getAmountByCategory,
  organizeCategoryData,
  formatAmount
} = require('../utils/records')

const recordController = {
  getRecords: async (req, res) => {
    try {
      const selectedDate = req.query.date
      const selectedCategory = req.query.category
      const userId = req.user._id
      let monthOfYearSet =
        !selectedCategory && !selectedDate
          ? new Set()
          : req.session.monthOfYearSet.split(' ')
      let totalAmount = 0
      let totalExpense = 0
      let totalRevenue = 0
      let { type } = req.params
      let filter = type ? { userId, type } : { userId }
      let page = type ? 'records' : 'index'

      let categoryList = await Category.find().lean().exec()

      // Add query string to filter
      if (selectedCategory) {
        const category = categoryList.find(
          category => category.name === selectedCategory
        )
        filter.categoryId = category._id
      }
      if (selectedDate) {
        const [year, month] = selectedDate.split('-')
        const startDate = new Date(selectedDate)
        const endDate = new Date(year, month, 0)
        filter.date = {
          $gte: startDate,
          $lt: endDate
        }
      }

      // Prepare chart data
      const [amountByMonth, amountByCategory] = await Promise.all([
        getAmountByMonth(filter),
        getAmountByCategory(filter)
      ])

      const categoryObject = organizeCategoryData(
        categoryList,
        amountByCategory
      )

      // Filter records to render record list
      const records = await Record.find(filter)
        .populate('categoryId')
        .lean()
        .sort({ date: 'desc' })
        .exec()

      records.forEach(record => {
        // Calculate total amount
        if (record.type === 'expense') {
          totalAmount -= record.amount
          totalExpense -= record.amount
        } else if (record.type === 'revenue') {
          totalAmount += record.amount
          totalRevenue += record.amount
        }

        // Format amount
        record.amount = formatAmount(record.amount)

        const date = moment.utc(record.date)
        // Reassign date format to render record list
        record.date = date.format('YYYY-MM-DD')

        if (!selectedCategory && !selectedDate) {
          // Store different months of years to render year-month filter
          monthOfYearSet.add(date.format('YYYY-MM'))
        }
      })

      if (!selectedCategory && !selectedDate) {
        // Save months of years to session for later use
        req.session.monthOfYearSet = [...monthOfYearSet].join(' ')
      }

      // Format total amount
      ;[totalAmount, totalExpense, totalRevenue] = formatAmount(
        totalAmount,
        totalExpense,
        totalRevenue
      )

      return res.render(page, {
        monthOfYearSet,
        categoryList,
        selectedDate,
        selectedCategory,
        totalAmount,
        records,
        indexCSS: true,
        type,
        categoryName: Object.keys(categoryObject),
        categoryAmount: Object.values(categoryObject),
        groupByMonth: Object.keys(amountByMonth),
        amountByMonth: Object.values(amountByMonth),
        chart: page === 'index' ? true : false,
        home: page === 'index' ? true : false,
        totalExpense,
        totalRevenue
      })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = recordController
