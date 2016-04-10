'use strict'

let router = require('koa-router')()

router.get('/a', function*(next) {
    this.res.end("hello /a")
})
module.exports = exports = function (app) {
    app.use(router.routes())
}
