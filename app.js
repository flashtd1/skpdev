const Koa = require('koa'),
    router = require('koa-router')(),
    serve = require('koa-static'),
    mount = require('koa-mount'),
    views = require('koa-views'),	// koaBody = require('koa-body'),
    fs = require('fs'),
    io = require('socket.io')(),
    api = new Koa(),
    projectPath = 'C:/Users/apple/Documents/work/dev/sketchup/floorplandetect', // 项目路径
    pluginName = 'FloorPlanPlugin' // 插件名称


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
    let loadpath = fs.readFileSync('./loadpath.txt', {encoding: 'utf-8'})
    return ctx.render('index', {
        params: {
            code: code,
            loadpath: loadpath
        }
    })
}

const initWatchFileServer = () => {
    let entryFilename = `${pluginName.toLowerCase()}.rb`
    let path = `${projectPath}/skpsrc/${pluginName}`
    fs.writeFileSync('loadpath.txt', path)
    
    // 初始化读取代码
    let script = fs.readFileSync(`${path}/${entryFilename}`, {
        encoding: 'utf-8'
    })
    fs.writeFileSync('./output.rb', script, {encoding:'utf-8'})
    
    fs.watch(path, null, (eType, filename) => {
        console.log(`${eType} ======= ${filename}`)
        let script = fs.readFileSync(`${path}/${filename}`, {
            encoding: 'utf-8'
        })
        if(filename === entryFilename) {
            fs.writeFileSync('./output.rb', script,{encoding:'utf-8'})
            client.emit('event', {
                event: 'entry',
                message: 'entry code changed'
            })
        } else {
            client.emit('event', {
                event: 'other',
                file: filename,
                message: `${filename} has changed`
            })
        }
    })
}

initSocket()
initApiServer()
initWatchFileServer()