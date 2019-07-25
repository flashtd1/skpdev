const Koa = require('koa'),
    router = require('koa-router')(),
    serve = require('koa-static'),
    mount = require('koa-mount'),
    views = require('koa-views'),	// koaBody = require('koa-body'),
    fs = require('fs'),
    io = require('socket.io')(),
    api = new Koa()


let client = null

const initSocket = () => {
    io.on('connection', (d) => {
        client = d
        client.on('event', (data) => {
            console.log(data)
        })

        client.on('disconnect', (socket) => {
            console.log('关闭连接：' + socket)
        })
    })
    let port = 9002
    io.listen(port)
}

const initApiServer = () => {

    router.get('/', async (ctx, next) => {
        await apiHandler(ctx)
    })
    
    api
        .use(mount('/node_modules', serve(__dirname + '/node_modules')))
        .use(views(__dirname + '/html', {extension:'pug'}))
        .use(router.routes())
        .use(router.allowedMethods())

    let port = 9001
    api.listen(port)
    console.log(`开启接口服务器，端口号：${port}`)
}

// API处理
const apiHandler = async (ctx) => {
    let code = fs.readFileSync('./output.rb', {encoding: 'utf-8'})
    return ctx.render('index', {
        params: {
            code: code
        }
    })
}

const initWatchFileServer = () => {
    let path = 'C:/Users/apple/Documents/work/dev/sketchup/floorplandetect/skpsrc/FloorPlanPlugin'
    fs.watch(path, null, (eType, filename) => {
        console.log(`${eType} ======= ${filename}`)
        let script = fs.readFileSync(`${path}/${filename}`, {
            encoding: 'utf-8'
        })
        fs.writeFileSync('./output.rb', script,{encoding:'utf-8'})
        client.emit('event', {
            data:'code change!'
        })
    })
}

initSocket()
initApiServer()
initWatchFileServer()