/**
 * Created by blake on 4/9/16.
 */
'use strict'

let app = require('koa')()
let path = require('path')
let router = require('./index')(app, path.resolve(__dirname, "./router"))

app.listen(2333)
console.log("启动服务器....")
