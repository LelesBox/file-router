'use strict'

let router = require('koa-router')()

router.get('/b', function*(next) {
  this.res.end("hello /b")
})

module.exports = exports = function(app) {
  app.use(router.routes())
}
