/**
 * Created by blake on 4/9/16.
 */
'use strict'

let app = require('koa')()
let router=require('./router')(app)

app.listen(2333)
console.log("启动服务器....")
