'use strict'

let router = require('koa-router')()

router.get('/a/b', function*(next) {
  this.res.end("hello /a/b.js")
})

module.exports = exports = function(app) {
  app.use(router.routes())
}
