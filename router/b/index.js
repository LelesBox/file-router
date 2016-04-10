'use strict'

let router = require('koa-router')()

function* controller(next) {
    this.res.end("hello /b")
}

module.exports = exports = function (app, path) {
    router.get(path, controller)
    app.use(router.routes())
}
