'use strict'

const fs = require('fs')
const path = require('path')

let routerDir = path.resolve(__dirname, "../router")

function walkDir(path, app) {
    fs.readdir(path, (err, files)=> {
            if (err) {
                return console.log(err)
            }

            for (let i = 0; i < files.length; i++) {
                let item = files[i]
                let p = path + "/" + item
                // 判断是否是文件夹，
                fs.stat(p, (err, sta)=> {
                        if (err) {
                            return console.log(err)
                        }
                        if (sta.isDirectory()) {
                            // 如果是文件夹则继续walkdir一边,递归查找
                            walkDir(p, app)
                        } else {
                            //在这里,我们必须先排除router/index不然就会造成扫描router文件夹然后自动调用自己...,当然,如果把扫描代码放在router外更好,这里只是单纯测试
                            if (p == routerDir + "/index.js") {
                                return
                            }
                            console.log(p)
                            require(p)(app)
                            // require(p)
                        }
                    }
                )
            }
        }
    )
}


module.exports = exports = function (app) {
    walkDir(routerDir, app)
}
