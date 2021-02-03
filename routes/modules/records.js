// Require Express and Express router
const express = require('express')
const router = express.Router()

// Require Record and Category model
const Record = require('../../models/record')

// Require category list
const categoryList = require('../../models/seeds/categories.json').results

// Set up routes
// New
router.get('/new', (req, res) => {
  res.render('new', { categoryList })
})

router.post('/', (req, res) => {
  const record = req.body
  const icon = categoryList.find(category => category.name === record.category)
    .icon
  record.date = record.date || Date.now()
  record.amount = parseFloat(record.amount)
  record.categoryIcon = icon

  Record.create(record)
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// Edit
router.get('/:id/edit', (req, res) => {
  const id = req.params.id
  Record.findById(id)
    .lean()
    .then(record => res.render('edit', { record, categoryList }))
    .catch(error => console.log(error))
})

router.put('/:id', (req, res) => {
  const id = req.params.id
  const newRecord = req.body
  newRecord.amount = parseFloat(newRecord.amount)
  Record.findById(id)
    .then(record => {
      record = Object.assign(record, newRecord)
      return record.save()
    })
    .then(() => res.redirect('/'))
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
  Record.find({ category: filter })
    .lean()
    .then(records => {
      let totalAmount = 0
      records.forEach(record => {
        totalAmount += record.amount
      })
      res.render('index', { records, totalAmount, categoryList })
    })
    .catch(error => console.log(error))
})

// Export router
module.exports = router
