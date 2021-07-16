// Require related packages
const bcrypt = require('bcryptjs')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const Record = require('../record')
const recordList = require('./records.json').results

const User = require('../../models/user')
const Category = require('../../models/category')

const userRecordCount = 20
const SEED_USERS = [
  {
    name: 'user1',
    email: 'user1@example.com',
    password: '12345678'
  },
  {
    name: 'user2',
    email: 'user2@example.com',
    password: '12345678'
  }
]

// Success
db.once('open', async () => {
  await new Promise(function (resolve) {
    SEED_USERS.forEach((seedUser, index) => {
      // hash the password for seed users
      // this will return a user model
      bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(seedUser.password, salt))
        .then(hash =>
          User.create({
            name: seedUser.name,
            email: seedUser.email,
            password: hash,
            avatar: `https://robohash.org/${seedUser.name}`
          })
        )
        .then(user => {
          // create records owned by the user
          // this will return a list of 3 records with userId
          return Promise.all(
            Array.from({ length: userRecordCount }, async (_, i) => {
              const record = recordList[i + index * userRecordCount]
              const category = await Category.findOne({ name: record.category })
                .lean()
                .exec()

              record.categoryId = category._id
              record.userId = user._id
              return Record.create(record)
            })
          )
        })
        .then(() => {
          console.log('done')
          if (index === SEED_USERS.length - 1) resolve()
        })
        .catch(err => console.log(err))
    })
  })
  db.close()
})
