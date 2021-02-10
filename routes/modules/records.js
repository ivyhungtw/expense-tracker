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

      Record.create(record)
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

// Edit page
router.get('/:id/edit', (req, res) => {
  // Get expense id
  const _id = req.params.id
  // Get category data
  Category.find()
    .lean()
    .then(categories => {
      // Find the record by _id
      Record.findById(_id)
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
  // Get record _id
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
      Record.findById(_id)
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
  const id = req.params.id
  Record.findById(id)
    .then(record => record.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// Filter
router.get('/', (req, res) => {
  const filter = req.query.filter
  if (!filter) return res.redirect('/')
  Category.find()
    .lean()
    .then(categories => {
      categories.forEach(category => {
        category.tempCategory = filter
      })
      Record.find({ category: filter })
        .lean()
        .then(records => {
          let totalAmount = 0
          records.forEach(record => {
            totalAmount += record.amount
          })
          totalAmount = new Intl.NumberFormat().format(totalAmount)
          res.render('index', {
            records,
            totalAmount,
            categoryList: categories,
            filter,
          })
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

// Export router
module.exports = router
