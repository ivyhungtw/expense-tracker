const Handlebars = require('handlebars')

Handlebars.registerHelper('eq', function (a, b) {
  return a === b
})
