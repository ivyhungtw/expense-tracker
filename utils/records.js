const Record = require('../models/record')

module.exports = {
  async getAmountByMonth(filter, type) {
    if (type) filter.type = type
    let amountByMonth = {}
    const result = await Record.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          count: {
            $sum: '$amount'
          }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ])

    result.forEach(el => {
      let date = Object.values(el._id).join('-')
      amountByMonth[date] = el.count
    })

    return amountByMonth
  },
  async getAmountByCategory(filter) {
    let amountByCategory = {}
    const result = await Record.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { category: '$categoryId' },
          count: {
            $sum: '$amount'
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])

    result.forEach(el => {
      let id = el._id.category
      amountByCategory[id] = el.count
    })

    return amountByCategory
  },
  organizeCategoryData(categoryList, amountByCategory) {
    const categoryObject = Object.assign(
      ...categoryList.map(category => ({
        [category.name]: amountByCategory[category._id] || 0
      }))
    )
    categoryList.forEach(category => {
      category.amount = categoryObject[category.name]
    })
    return categoryObject
  },
  formatAmount(...amount) {
    return amount.map(el => new Intl.NumberFormat().format(el))
  }
}
