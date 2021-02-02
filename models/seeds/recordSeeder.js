// Require related packages
const db = require('../../config/mongoose')
const Record = require('../record')
const recordList = require('./records.json').results
const categoryList = require('./categories.json').results

// Success
db.once('open', () => {
  recordList.forEach(record => {
    const icon = categoryList.find(
      category => category.name === record.category
    ).icon
    console.log(icon)
    record.categoryIcon = icon
    Record.create(record)
  })
  console.log('done')
})
