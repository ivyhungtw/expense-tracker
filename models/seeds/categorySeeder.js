// Require related packages
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const Category = require('../category')
const categoryList = require('./categories.json').results

// Success
db.once('open', () => {
  const categories = []
  categoryList.forEach(category => {
    categories.push(category)
  })
  Category.create(categories)
    .then(() => {
      console.log('insert data done...')
      return db.close()
    })
    .then(() => console.log('database connection close'))
})
