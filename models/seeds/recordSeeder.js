// Require related packages
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const Record = require('../record')
const recordList = require('./records.json').results
const categoryList = require('./categories.json').results

// Success
db.once('open', () => {
  const records = []
  recordList.forEach(record => {
    const icon = categoryList.find(
      category => category.name === record.category
    ).icon
    record.categoryIcon = icon
    records.push(record)
  })
  Record.create(records)
    .then(() => {
      console.log('insert data done...')
      return db.close()
    })
    .then(() => console.log('database connection close'))
})
