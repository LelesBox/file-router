# 用Node.js 遍历文件夹 之 基于koa和koa-router的一种路由组织方式

>最近几次在node编码中遇到需要遍历文件夹，有两种情况，一是使用node把某个文件夹文件上传到S3上，另一个场景是扫描某个文件夹下的js文件并自动 require。

第一种情况很常见，在程序运行当中无法使用官方shell版本上传脚本时候，必须得自己手动遍历文件夹的文件并上传

第二种情况下，让某个文件夹下的所有node模块自动 require， 可以达到自动注入代码的效果，而无需手动去引用它，举个node的例子：

## 例子 之 文件结构当做路由表

如果使用原生koa，并且配合koa-router来开发的时候，我们很容易根据路由写成如下代码
**`app.js`**

```javascript
/** 
 * Created by blake on 4/9/16.
 */
'use strict'

let app = require('koa')()

let router = require('koa-router')()

router.get('/a', function*(next) {
    this.res.end("hello /a")
}).get('/a/b', function*(next) {
    this.res.end('hello /a/b')
}).get('/b', function*(next) {
    this.res.end('hello /b')
}).get('/b/a', function*(next) {
    this.res.end('hello /b/a')
})

app.use(router.routes())

app.listen(2333)

console.log("启动服务器....")

```

这段代码我们显式写明了路由规则，如`/a` `/a/b` `/b` `/b/a` 等，当路由较少的时候这样做并没有什么问题，但是当路由变多，且出现很多嵌套，文件将会过长，此时我们普遍做法是把代码拆分成模块，并在入口文件中`app.js`引用它，这时我们添加`router.js`文件`，用于编写路由相关的代码：

**`router.js`**

```
'use strict'

let router = require('koa-router')()

router.get('/a', function*(next) {
  this.res.end("hello /a")
}).get('/a/b', function*(next) {
  this.res.end('hello /a/b')
}).get('/b', function*(next) {
  this.res.end('hello /b')
}).get('/b/a', function*(next) {
  this.res.end('hello /b/a')
})

module.exports = exports = function(app) {
  app.use(router.routes())
}

```

**`app.js`**

```
'use strict'

let app = require('koa')()
let router=require('./router')(app)

app.listen(2333)
console.log("启动服务器....")


```

这种方式的确做到了把路由代码分离出去，但是还是不能解决如果路由逻辑代码过长时，同样会导致`router.js`会被写得越来越长，所以，更好的方式是根据每个路由去拆分代码，当根据路由拆分代码时，外面新建文件夹router，并把路由相关代码写在这里，在router文件夹下新建 `a.js` `b.js`  <del>a_b.js</del> <del>b_a.js</del>。

**`router/a.js`**

```
'use strict'

let router = require('koa-router')()

router.get('/a', function*(next) {
  this.res.end("hello /a")
})

module.exports = exports = function(app) {
  app.use(router.routes())
}

```

**`router/b.js`**

```
'use strict'

let router = require('koa-router')()

router.get('/b', function*(next) {
  this.res.end("hello /b")
})

module.exports = exports = function(app) {
  app.use(router.routes())
}

```

**`router/a_b.js`**

到这里，我们会有疑问，为什么非要用个下划线分割开来，直接用成 `router/a/b.js`不成吗，嗯，成，那就在router文件夹下再新建一个文件夹`a`，并在`a`文件夹下新建`b.js`文件

所以更新后**`router/a/b.js`**

```
'use strict'

let router = require('koa-router')()

router.get('/a/b', function*(next) {
  this.res.end("hello /a/b.js")
})

module.exports = exports = function(app) {
  app.use(router.routes())
}

```

**`router/b/a.js`**

```
'use strict'

let router = require('koa-router')()

router.get('/b/a', function*(next) {
  this.res.end("hello /b/a")
})

module.exports = exports = function(app) {
  app.use(router.routes())
}

```

我们还需要一个index去集合这些路由

**`router/index.js`**

```
'use strict'

module.exports = exports = function(app) {
  require('./a.js')(app)
  require('./b.js')(app)
  require('./a/b.js')(app)
  require('./b/a.js')(app)
}

```

**`app.js 保持不变`**

```
/**
 * Created by blake on 4/9/16.
 */
'use strict'

let app = require('koa')()
let router=require('./router')(app)

app.listen(2333)
console.log("启动服务器....")

```

到这里，我们已经按路由把文件拆分成一个个文件，再也不用担心某一路由下的逻辑代码过长的问题，但是为了统一集合这么多分散的js文件，我们必须在`router/index.js`写下全部的js路径并require，显然，当路由数量多的时候，index.js代码长度也会变得很长，出现一列的`require(xxx)`，我想，可不可以把require各个路由代码的行为自动化，至少做到在不修改`router/index.js`代码的情况下，可以新增或者删除一个路由（既新增或者删除某一个.js文件)。这里在`router/index.js`文件里就要实现自动require路由模块

我们发现路由的规则如 `/a` `/b` `/a/b` `/b/a` 对应着router文件夹下的 `/a.js` `/b.js` `/a/b.js` `/b/a.js`，基于此，我们可以根据文件名去得到路由模块地址，从而实现自动加载，达到的效果就是router下的文件能映射到路由的规则，打开router文件夹可以很直观的能看到显而易见的路由树形结构。

![Snip20160410_3](http://7xqkyz.com1.z0.glb.clouddn.com/2016-04-10-Snip20160410_3.png)

对应的是 `/a/b` `/b/a` `/a` `/b`， 但是这里`a.js`放在`a`文件夹外面总感觉很别扭，`a.js`最好也应该在`a`文件夹下：

![Snip20160410_1](http://7xqkyz.com1.z0.glb.clouddn.com/2016-04-10-Snip20160410_1.png)

显然这样看起来也不好，如果有`/a/a`这样的路由规则的话就会出现歧义，到底表示的是`/a` 或者是 `/a/a`，当然，设计路由的时候出现`/a/a`也是不能被接受的，但更有意义的做法我觉得应该是把`a.js`换成`index.js`表示根路径：

![Snip20160410_2](http://7xqkyz.com1.z0.glb.clouddn.com/2016-04-10-Snip20160410_2.png)

此时，router下的index.js改成：

**`router/index.js`**

```
'use strict'

module.exports = exports = function(app) {
  require('./a')(app)
  require('./b')(app)
  require('./a/b')(app)
  require('./b/a')(app)
}
```

## 自动扫描router文件

针对上面的`router/index.js`代码，之前说过，require那部分的路径是可以让程序自动扫描出来，所以就引出了今天的主题 😂，***Node.js遍历文件夹***

要扫描router目录下的文件夹内所有文件，我们知道遍历文件夹树至少有两种写法，一种是递归，一种是循环。

**`递归版 router/index.js`**

```javascript
'use strict'

const fs = require('fs')
const path = require('path')

let p = path.resolve(__dirname, "../router")

function walkDir(path) {
    fs.readdir(path, (err, files)=> {
            if (err) {
                return console.log(err)
            }
            for (let i = 0; i < files.length; i++) {
                let item = files[i]
                //这里p要在异步回调内被引用，注意会有闭包的坑，所以使用let关键字，无视闭包陷阱
                let p = path + "/" + item
                // 判断是否是文件夹，
                fs.stat(p, (err, sta)=> {
                        if (err) {
                            return console.log(err)
                        }
                        if (sta.isDirectory()) {
                            // 如果是文件夹则继续walkdir一边,递归查找
                            walkDir(p)
                        } else {
                            // 否则这里就是终点,打印出地址
                            console.log(p)
                            // require(p)
                        }
                    }
                )
            }
        }
    )
}

// 测试

walkDir(p)


module.exports = exports = function (app) {
    require('./a')(app)
    require('./b')(app)
    require('./a/b')(app)
    require('./b/a')(app)
}
```

打印出:

![Snip20160410_4](http://7xqkyz.com1.z0.glb.clouddn.com/2016-04-10-Snip20160410_4.png)

没问题，这时候我们可以让它自动require，对了，顺便说一句，由于node的各种回调异步，导致在for循环的时候出现闭包的坑，所以建议使用关键字`let`声明，而不用`var`可以省去很多闹心的烦恼

最终代码:

```
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

```

我们还有非递归的版本，使用while循环遍历列表，代码如下：

**`循环版 router/index.js`**

```
'use strict'

const fs = require('fs')
const path = require('path')

let routerDir = path.resolve(__dirname, "../router")

function walkDirLoop(path, app) {
    fs.readdir(path, (err, files)=> {
        if (err) {
            return console.log(err)
        }
        //定义一个保存路径的数组
        let pathArr = []
        //    首先排除掉router/index.js本身,免得自己调用自己造成循环调用
        files = files.filter(item=> {
            return item !== "index.js"
        }).map(item=> {
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
                    dir = dir.map(item=> {
                        return tmp + "/" + item
                    })
                    pathArr = pathArr.concat(dir)
                } else {
                    require(tmp)(app)
                }
            }
        } catch (e) {
            console.log(e)
        }
    })
}


module.exports = exports = function (app) {
    walkDirLoop(routerDir, app)
}

```

#### 最后的小问题

我们已经可以做到新增一个路由文件时不会去更改index.js的代码，但是我们发现路由文件里，路径还要显式标注出来

![Snip20160410_5](http://7xqkyz.com1.z0.glb.clouddn.com/2016-04-10-Snip20160410_5.png)

我们的目标就是消除这显示写法，因为既然它写在b文件夹的a.js里，我们默认它的路径就是/b/a，所以我们在这里在新增一个传参`path`，写法如下：

```
'use strict'

let router = require('koa-router')()

function* controller(next) {
    this.res.end("hello /b/a")
}

module.exports = exports = function (app, path) {
    router.get(path, controller)
    app.use(router.routes())
}

```

此时，在`router/index.js`中的require中，加上路径参数，用循环版的代码做例子，

![Snip20160410_7](http://7xqkyz.com1.z0.glb.clouddn.com/2016-04-10-Snip20160410_7.png)


## 结尾

到这里，实验结束。主要因为一个nodejs遍历文件夹引出了的一个例子，但这样的路由组织方式应该还可以再优化，比如把`router/index.js`提到router文件夹外面，并新增一个参数让它可以任意让某个文件夹成为路由文件夹。




