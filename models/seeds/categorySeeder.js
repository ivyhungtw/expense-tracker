// Require related packages
const db = require('../../config/mongoose')
const Category = require('../category')
const categoryList = require('./categories.json').results

// Success
db.once('open', () => {
  categoryList.forEach(category => {
    Category.create(category)
  })
  console.log('done!')
})
