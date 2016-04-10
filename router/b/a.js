'use strict'

let router = require('koa-router')()

router.get('/b/a', function*(next) {
  this.res.end("hello /b/a")
})

module.exports = exports = function(app) {
  app.use(router.routes())
}
