# skpdev


## 安装
项目克隆之后执行```npm install```安装依赖

生成sketchup插件```npm run buildrbz```，命令完成后，在rbzdist目录找到SkpDev-x.x.x.rbz文件

在sketchup中安装此插件


## 使用
在app.js中，修改``projectPath``和``projectName``，配置插件加载路径

在本项目内，执行```node app.js```启动监听服务器

在sketchup中开启SkpDev插件


## 开发
在sketchup中打开ruby控制台，将本项目地址加入到LOAD_PATH中
在ruby中执行skpsrc/SkpDev/skpdev.rb文件启动插件
