// Require related packages
const bcrypt = require('bcryptjs')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const Record = require('../record')
const recordList = require('./records.json').results
const categoryList = require('./categories.json').results

const User = require('../../models/user')

const SEED_USER = {
  email: 'root@example.com',
  password: '123456',
}

// Success
db.once('open', () => {
  const records = []
  // Create user
  bcrypt
    .genSalt(10)
    .then(salt => bcrypt.hash(SEED_USER.password, salt))
    .then(hash =>
      User.create({
        email: SEED_USER.email,
        password: hash,
      })
    )
    .then(user => {
      recordList.forEach(record => {
        const icon = categoryList.find(
          category => category.name === record.category
        ).icon
        record.categoryIcon = icon
        record.userId = user._id
        records.push(record)
      })
      Record.create(records)
        .then(() => {
          console.log('insert data done...')
          return db.close()
        })
        .then(() => console.log('database connection close'))
    })
})
