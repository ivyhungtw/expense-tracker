// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require Record and Category model
const Record = require('../../models/record')
const Category = require('../../models/category')

// Require other packages
const moment = require('moment')

// Set up routes
// Add expense page
router.get('/new', async (req, res) => {
  try {
    const categoryList = await Category.find().lean().exec()

    return res.render('new', { categoryList, formCSS: true })
  } catch (err) {
    console.warn(err)
  }
})

// Confirm creation
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id

    // Save the record to record collection
    await Record.create({ ...req.body, userId })

    return res.redirect('/')
  } catch (err) {
    console.warn(err)
  }
})

// Edit page
router.get('/:id/edit', async (req, res) => {
  try {
    const userId = req.user._id
    const _id = req.params.id
    const [record, categoryList] = await Promise.all([
      Record.findOne({ _id, userId }).populate('categoryId').lean().exec(),
      Category.find().lean().exec(),
    ])

    record.date = moment.utc(record.date).format('YYYY-MM-DD')

    return res.render('edit', {
      record,
      categoryList,
      formCSS: true,
    })
  } catch (err) {
    console.warn(err)
  }
})

// Confirm editing
router.put('/:id', async (req, res) => {
  try {
    // Get user id and record _id
    const userId = req.user._id
    const _id = req.params.id
    const newRecord = { ...req.body, userId }
    // Find the original record by _id and userId
    let record = await Record.findOne({ _id, userId }).exec()

    // Reassign new record data and save to record collection
    record = Object.assign(record, newRecord)
    await record.save()

    return res.redirect('/')
  } catch (err) {
    console.warn(err)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id
    const _id = req.params.id
    // Find the record
    const record = await Record.findOne({ _id, userId }).exec()
    // Remove the record from database
    await record.remove()

    return res.redirect('/')
  } catch (err) {
    console.warn(err)
  }
})

// Filter
router.get('/', async (req, res) => {
  try {
    // Get data from request and model
    const selectedDate = req.query.date
    const selectedCategory = req.query.category
    const userId = req.user._id
    const monthOfYearSet = req.session.monthOfYearSet.split(' ')
    const categoryList = await Category.find().lean().exec()

    // Initiate variables
    let totalAmount = 0
    const filter = { userId }

    // If there is no query string, return to home page
    if (!selectedCategory && !selectedDate) return res.redirect('/')

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
        $lt: endDate,
      }
    }

    // Filter records to render record list
    const filteredRecords = await Record.find(filter)
      .populate('categoryId')
      .lean()
      .sort({ date: 'desc' })
      .exec()
    // Calculate total amount, and reassign date format
    filteredRecords.forEach(record => {
      totalAmount += record.amount
      record.date = moment.utc(record.date).format('YYYY-MM-DD')
    })
    // Format total amount
    totalAmount = new Intl.NumberFormat().format(totalAmount)

    return res.render('index', {
      monthOfYearSet,
      categoryList,
      selectedDate,
      selectedCategory,
      totalAmount,
      records: filteredRecords,
      indexCSS: true,
    })
  } catch (err) {
    console.warn(err)
  }
})

// Export router
module.exports = router
