// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require Record and Category model
const Record = require('../../models/record')
const Category = require('../../models/category')

// Require category list
const categoryList = require('../../models/seeds/categories.json').results

// Set up routes
// Add expense page
router.get('/new', (req, res) => {
  // Get category data for category dropdown
  Category.find()
    .lean()
    .then(categories => {
      // render with new.hbs
      return res.render('new', { categoryList: categories })
    })
    .catch(error => console.log(error))
})

// Confirm creation
router.post('/', (req, res) => {
  const userId = req.user._id
  // Get form data form request body
  const record = req.body
  // Get icon
  Category.findOne({ name: record.category })
    .lean()
    .then(category => {
      const icon = category.icon
      record.date = record.date || Date.now()
      record.amount = parseFloat(record.amount)
      record.categoryIcon = icon
      record.userId = userId

      Record.create(record)
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

// Edit page
router.get('/:id/edit', (req, res) => {
  // Get user id and expense id
  const userId = req.user._id
  const _id = req.params.id
  // Get category data
  Category.find()
    .lean()
    .then(categories => {
      // Find the record by _id
      Record.findOne({ _id, userId })
        .lean()
        .then(record => {
          // Save category status for eq function
          categories.forEach(category => {
            category.tempCategory = record.category
          })

          return res.render('edit', { record, categoryList: categories })
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

// Confirm editing
router.put('/:id', (req, res) => {
  // Get user id and record _id
  const userId = req.user._id
  const _id = req.params.id
  // Get form data form request body
  const newRecord = req.body
  // Find the icon data from category model
  Category.findOne({ name: newRecord.category })
    .lean()
    .then(category => {
      const icon = category.icon
      // Add icon info
      newRecord.categoryIcon = icon
      // Change amount type from string to number
      newRecord.amount = parseFloat(newRecord.amount)
      // Find original record data by _id
      Record.findOne({ _id, userId })
        .then(record => {
          // Reassign new record data and save to model
          record = Object.assign(record, newRecord)
          return record.save()
        })
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

router.delete('/:id', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  Record.findOne({ _id, userId })
    .then(record => record.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// Filter
router.get('/', (req, res) => {
  const userId = req.user._id
  const dateSet = new Set()
  const category = req.query.category
  const date = req.query.date
  // Initiate filter variable
  const filter = { userId }

  // If no query string, return home page
  if (!category && !date) return res.redirect('/')
  // Add query string to filter
  if (category) filter.category = category
  if (date) filter.date = new RegExp('^' + date)

  // Store all months of records to dateSet
  Record.find({ userId })
    .lean()
    .sort({ date: 'desc' })
    .then(records => {
      records.forEach(record => {
        const recordDate = record.date.slice(0, 7)
        if (recordDate !== date) dateSet.add(recordDate)
      })
    })

  Category.find()
    .lean()
    .then(categories => {
      categories.forEach(el => {
        el.tempCategory = category
      })
      // Render records according to filter
      Record.find(filter)
        .lean()
        .then(records => {
          let totalAmount = 0
          // Calculate total amount
          records.forEach(record => {
            totalAmount += record.amount
          })
          // Format total amount
          totalAmount = new Intl.NumberFormat().format(totalAmount)
          res.render('index', {
            records,
            totalAmount,
            categoryList: categories,
            selectDate: date,
            category,
            dateSet,
          })
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

// Export router
module.exports = router
