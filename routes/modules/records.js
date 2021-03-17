// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require Record and Category model
const Record = require('../../models/record')
const Category = require('../../models/category')

// Set up routes
// Add expense page
router.get('/new', async (req, res) => {
  let categories

  // Get category data for category dropdown
  try {
    categories = await Category.find().lean().exec()
  } catch (err) {
    console.warn(err)
  }

  return res.render('new', { categoryList: categories })
})

// Confirm creation
router.post('/', async (req, res) => {
  const userId = req.user._id
  // Get form data form request body
  const record = req.body

  try {
    const category = await Category.findOne({ name: record.category })
      .lean()
      .exec()

    record.date = record.date || Date.now()
    record.amount = parseFloat(record.amount)
    record.categoryIcon = category.icon
    record.userId = userId
  } catch (err) {
    console.warn(err)
  }

  try {
    const createRecord = await Record.create(record)
  } catch (err) {
    console.warn(err)
  }

  return res.redirect('/')
})

// Edit page
router.get('/:id/edit', async (req, res) => {
  // Get user id and expense id
  const userId = req.user._id
  const _id = req.params.id
  let record
  let categories

  // Find the record by _id and userId
  try {
    record = await Record.findOne({ _id, userId }).lean().exec()
  } catch (err) {
    console.warn(err)
  }

  // Get category data
  try {
    categories = await Category.find().lean().exec()

    // Save category status of the record for eq function
    categories.forEach(category => {
      category.tempCategory = record.category
    })
  } catch (err) {
    console.warn(err)
  }

  return res.render('edit', { record, categoryList: categories })
})

// Confirm editing
router.put('/:id', async (req, res) => {
  // Get user id and record _id
  const userId = req.user._id
  const _id = req.params.id
  // Get form data form request body
  const newRecord = req.body

  let record

  // Find the icon info from category collection
  try {
    const category = await Category.findOne({ name: newRecord.category })
      .lean()
      .exec()
    // Add icon info to the new record
    newRecord.categoryIcon = category.icon
    // Change amount type from string to number
    newRecord.amount = parseFloat(newRecord.amount)
  } catch (err) {
    console.warn(err)
  }

  // Find original record data by _id and userId
  try {
    record = await Record.findOne({ _id, userId }).exec()
    // Reassign new record data and save to record collection
    record = Object.assign(record, newRecord)
  } catch (err) {
    console.warn(err)
  }

  try {
    const saveRecord = await record.save()
  } catch (err) {
    console.warn(err)
  }

  // Return to home page
  return res.redirect('/')
})

router.delete('/:id', async (req, res) => {
  const userId = req.user._id
  const _id = req.params.id

  try {
    // Find the record
    const record = await Record.findOne({ _id, userId }).exec()
    // Remove the record from database
    record.remove()
  } catch (err) {
    console.warn(err)
  }

  // Return to home page
  return res.redirect('/')
})

// Filter
router.get('/', async (req, res) => {
  const userId = req.user._id
  const category = req.query.category
  const date = req.query.date
  // Initiate filter variable
  const filter = { userId }

  // If no query string, return home page
  if (!category && !date) return res.redirect('/')
  // Add query string to filter
  if (category) filter.category = category
  if (date) filter.date = new RegExp('^' + date)

  const dateSet = new Set()
  let categories
  let filteredRecords
  let totalAmount = 0

  try {
    // Find all records of the user
    const records = await Record.find({ userId })
      .lean()
      .sort({ date: 'desc' })
      .exec()

    // Store all months of records to dateSet
    records.forEach(record => {
      const recordDate = record.date.slice(0, 7)
      if (recordDate !== date) dateSet.add(recordDate)
    })
  } catch (err) {
    console.warn(err)
  }

  try {
    categories = await Category.find().lean().exec()

    categories.forEach(el => {
      el.tempCategory = category
    })
  } catch (err) {
    console.warn(err)
  }

  try {
    filteredRecords = await Record.find(filter)
      .lean()
      .sort({ date: 'desc' })
      .exec()

    // Calculate total amount
    filteredRecords.forEach(record => {
      totalAmount += record.amount
    })
    // Format total amount
    totalAmount = new Intl.NumberFormat().format(totalAmount)
  } catch (err) {
    console.warn(err)
  }

  return res.render('index', {
    records: filteredRecords,
    totalAmount,
    categoryList: categories,
    selectDate: date,
    dateSet,
  })
})

// Export router
module.exports = router
