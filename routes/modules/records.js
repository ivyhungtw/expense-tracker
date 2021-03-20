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
    const record = req.body

    // Find category of the record
    const category = await Category.findOne({ name: record.category })
      .lean()
      .exec()
    // Reassign the record's categoryIcon attribute
    record.categoryIcon = category.icon

    // Save the record to record collection
    await Record.create({ ...record, userId })

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
    const [record, categories] = await Promise.all([
      Record.findOne({ _id, userId }).lean().exec(),
      Category.find().lean().exec(),
    ])

    record.date = moment.utc(record.date).format('YYYY-MM-DD')

    return res.render('edit', {
      record,
      selectedCategory: record.category,
      categoryList: categories,
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
    // Get form data form request body
    const newRecord = req.body
    // Find the icon info from category collection,
    // and the original record data by _id and userId
    let [category, record] = await Promise.all([
      Category.findOne({ name: newRecord.category }).lean().exec(),
      Record.findOne({ _id, userId }).exec(),
    ])

    // Add icon info to the new record
    newRecord.categoryIcon = category.icon

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
    const userId = req.user._id
    const selectedDate = req.query.date
    const selectedCategory = req.query.category
    const monthOfYearSet = new Set()
    let totalAmount = 0

    // Initiate filter variable
    const filter = { userId }
    // If there is no query string, return to home page
    if (!selectedCategory && !selectedDate) return res.redirect('/')
    // Add query string to filter
    if (selectedCategory) filter.category = selectedCategory
    if (selectedDate) {
      const [year, month] = selectedDate.split('-')
      const startDate = new Date(selectedDate)
      const endDate = new Date(year, month, 0)
      filter.date = {
        $gte: startDate,
        $lt: endDate,
      }
    }

    const [records, categoryList, filteredRecords] = await Promise.all([
      Record.find({ userId }).lean().sort({ date: 'desc' }).exec(),
      Category.find().lean().exec(),
      Record.find(filter).lean().sort({ date: 'desc' }).exec(),
    ])

    // Iterate over all records,
    // and store different months of years to render year-month filter
    records.forEach(record => {
      const date = moment.utc(record.date)
      monthOfYearSet.add(date.format('YYYY-MM'))
      record.date = date.format('YYYY-MM-DD')
    })

    // Iterate over filtered records
    // to calculate total amount,
    // and reassign date format to render record list
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
