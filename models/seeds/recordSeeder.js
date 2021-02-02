// Require related packages
const db = require('../../config/mongoose')
const Record = require('../record')
const recordList = require('./records.json').results

// Success
db.once('open', () => {
  recordList.forEach(record => {
    Record.create(record)
  })
  console.log('done')
})
