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
      const pageNumber = Number(req.query.page) || 1
      const PAGE_LIMIT = 15
      const offset = (pageNumber - 1) * PAGE_LIMIT
      const budget = req.user.budget
      let formattedBudget

      let categoryList = await Category.find({ type: 'expense' }).lean().exec()

      // Add query string to filter
      if (selectedCategory) {
        const category = categoryList.find(
          category => category.name === selectedCategory
        )
        filter.categoryId = category._id
      }

      const amountByMonth = await getAmountByMonth(filter)
      let currentDate = moment.utc(new Date()).format('YYYY-M')
      let filterDate

      if (selectedDate !== 'all') {
        filterDate = selectedDate ? selectedDate : currentDate
        const [year, month] = filterDate.split('-')
        filter.year = Number(year)
        filter.month = Number(month)
      }

      let records = await Record.aggregate([
        {
          $addFields: { year: { $year: '$date' }, month: { $month: '$date' } }
        },
        { $match: filter },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: offset }, { $limit: PAGE_LIMIT }],
            data2: [{ $group: { _id: '$type', count: { $sum: '$amount' } } }],
            data3: [
              {
                $group: {
                  _id: { category: '$categoryId' },
                  count: { $sum: '$amount' }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ])

      const metadata = records[0].metadata[0]
      const amountData = records[0].data2
      const categoryData = records[0].data3
      const totalRecords = metadata ? metadata.total : 0

      const pages = Math.ceil(totalRecords / PAGE_LIMIT)

      amountData.forEach(data => {
        if (data._id === 'expense') {
          totalExpense -= data.count
        } else if (data._id === 'revenue') {
          totalRevenue += data.count
        }
      })
      totalAmount = totalExpense + totalRevenue

      let amountByCategory = {}
      categoryData.forEach(el => {
        let id = el._id.category
        amountByCategory[id] = el.count
      })

      records = records[0].data

      let groupByMonth = Object.keys(amountByMonth)
      if (!selectedCategory && !selectedDate) {
        // Store different months of years to render month filter
        monthOfYearSet.add(currentDate)
        groupByMonth.forEach(month => {
          monthOfYearSet.add(month)
        })

        // Save months of years to session for later use
        req.session.monthOfYearSet = [...monthOfYearSet].join(' ')
      }
      const categoryObject = organizeCategoryData(
        categoryList,
        amountByCategory
      )

      records.forEach(record => {
        // Format amount
        record.amount = formatAmount(record.amount)

        const date = moment.utc(record.date)
        // Reassign date format to render record list
        record.date = date.format('YYYY-MM-DD')
      })

      // Data for budget chart
      let spent = -totalExpense
      let remaining = budget + totalExpense
      let budgetAmount = [spent, remaining]

      // Format total amount
      ;[totalAmount, totalExpense, totalRevenue, formattedBudget, remaining] =
        formatAmount(totalAmount, totalExpense, totalRevenue, budget, remaining)

      // data for pagination
      const totalPage = Array.from({ length: pages }).map(
        (_, index) => index + 1
      )
      const prev = pageNumber - 1 < 1 ? 1 : pageNumber - 1
      const next = pageNumber + 1 > pages ? pages : page + 1

      // Show warning messages to improver customer experience
      let beginner
      let noFilterResult
      if (!selectedCategory && !selectedDate && !records.length) {
        beginner = true
      }
      if ((selectedCategory || selectedDate) && !records.length) {
        noFilterResult = true
      }

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
        budgetAmount,
        groupByMonth,
        amountByMonth: Object.values(amountByMonth),
        chart: page === 'index' ? true : false,
        home: page === 'index' ? true : false,
        totalExpense,
        totalRevenue,
        beginner,
        noFilterResult,
        totalPage,
        prev,
        next,
        pages,
        pageNumber,
        filterDate,
        totalRecords,
        formattedBudget,
        budget,
        remaining
      })
    } catch (err) {
      console.warn(err)
    }
  },
  createRecord: async (req, res) => {
    try {
      const categoryList = await Category.find().lean().exec()

      return res.render('new', {
        categoryList,
        formCSS: true,
        type: req.query.type
      })
    } catch (err) {
      console.warn(err)
    }
  },
  postRecord: async (req, res) => {
    try {
      await Record.create({ ...req.body, userId: req.user._id })

      return res.redirect(`/records/${req.body.type}`)
    } catch (err) {
      console.warn(err)
    }
  },
  editRecord: async (req, res) => {
    try {
      const [record, categoryList] = await Promise.all([
        Record.findOne({ _id: req.params.id, userId: req.user._id })
          .populate('categoryId')
          .lean()
          .exec(),
        Category.find().lean().exec()
      ])

      record.date = moment.utc(record.date).format('YYYY-MM-DD')

      return res.render('edit', {
        record,
        categoryList,
        type: req.query.type,
        formCSS: true
      })
    } catch (err) {
      console.warn(err)
    }
  },
  putRecord: async (req, res) => {
    try {
      const userId = req.user._id
      const newRecord = { ...req.body, userId }
      let record = await Record.findOne({ _id: req.params.id, userId }).exec()

      // Reassign new record data and save to record collection
      record = Object.assign(record, newRecord)
      await record.save()

      return res.redirect(`/records/${newRecord.type}`)
    } catch (err) {
      console.warn(err)
    }
  },
  deleteRecord: async (req, res) => {
    try {
      const record = await Record.findOne({
        _id: req.params.id,
        userId: req.user._id
      }).exec()

      await record.remove()

      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = recordController
