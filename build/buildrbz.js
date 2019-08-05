/**
 * 打包rbz文件
 * 将dist里的内容都打包到rbzsrc/html中
 * 将skpsrc里的内容复制到rbzsrc中
 * 将rbzsrc里的所有文件打包成zip,放到rbzdist目录，并且修改名称为rbz
 * 完成
 */

const fs = require('fs'),
    fse = require('fs-extra'),
    cp = require('child_process'),
    arc = require('archiver')

console.log('清除环境')
if(fs.existsSync('rbzsrc')) {
    fse.emptyDirSync('rbzsrc')
    fs.rmdirSync('rbzsrc')
}

if(fs.existsSync('rbzdist')) {
    fse.emptyDirSync('rbzdist')
    fs.rmdirSync('rbzdist')
}

console.log('设置版本号')
let version = '1.0.0'
versionArgv = process.argv.filter((argv) => {
    return argv.match(/V=\d+.\d+/)
})

if(versionArgv.length > 0) {
    version = versionArgv[0].substring(2)
}
console.log(version)

let tableRubyScript = fs.readFileSync('skpsrc/SkpDev.rbconf', {encoding: 'utf-8'})
let newTableRubyScript = tableRubyScript.replace(/%VERSION%/, `"${version}"`)

console.log('生成rbz')
fs.mkdirSync('rbzsrc')
fs.writeFileSync('rbzsrc/SkpDev.rb', newTableRubyScript)

let a = cp.spawnSync('xcopy', ['skpsrc\\SkpDev', 'rbzsrc\\SkpDev\\', '/c/e/r/y'])
console.log(a)

cp.spawnSync('xcopy', ['dist', 'rbzsrc\\SkpDev\\html\\', '/c/e/r/y'])
fs.mkdirSync('rbzdist')

let output = fs.createWriteStream(`rbzdist/SkpDev-${version}.rbz`)
let archive = arc('zip', {
    zlib: {level: 9}
})

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    console.log('如需签名，访问如下地址')
    console.log('https://extensions.sketchup.com/developer_center/extension_signature')
    process.exit(0);
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
    console.log('Data has been drained');
});


archive.pipe(output)

archive.file('rbzsrc/SkpDev.rb', {name:"SkpDev.rb"})
archive.file('rbzsrc/version.txt', {name:"version.txt"})
archive.directory('rbzsrc/SkpDev/', "SkpDev")

archive.finalize()
