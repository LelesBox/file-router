'use strict'

const fs = require('fs')
const path = require('path')

let routerDir;

function walkDirLoop(path, app) {
    fs.readdir(path, (err, files) => {
        if (err) {
            return console.log(err)
        }
        //定义一个保存路径的数组
        let pathArr = []
        //    首先排除掉router/index.js本身,免得自己调用自己造成循环调用
        files = files.filter(item => {
            return item !== "index.js"
        }).map(item => {
            return path + "/" + item
        })

        pathArr = pathArr.concat(files)
        //    循环读取pathArr里面的路径,如果发现是
        let tmp
        try {
            while (tmp = pathArr.shift()) {
                // 如果使用异步,在pathArr还没来得及被动态添加数据的时候便提前结束,
                //所以这里的文件操作要使用同步操作
                let stat = fs.statSync(tmp)
                if (stat.isDirectory()) {
                    //添加子路径
                    let dir = fs.readdirSync(tmp)
                    dir = dir.map(item => {
                        return tmp + "/" + item
                    })
                    pathArr = pathArr.concat(dir)
                } else {
                    require(tmp)(app, tmp.replace(routerDir, "").replace(".js", "").replace(/\/index$/, ""))
                }
            }
        } catch (e) {
            console.log(e)
        }
    })
}


module.exports = exports = function (app, path) {
    routerDir=path
    walkDirLoop(path, app)
}
