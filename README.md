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
原理：
* 由node端开启socket服务器、web服务器并watch特定的目录
* 在sketchup启动插件之后，加载浏览器指向web服务器地址，形成web服务器与sketchup的关联
* web服务器向sketchup发送watch指定的目录加载到$LOAD_PATH中，完成加载目录设置，方便项目中的ruby文件引用，但是考虑到代码会更新，因此所有的自编写文件引用都是load，否则无法重复加载，最终发布的时候，可以把代码都改成require
* 当watch侦测到目标文件发生变化，则通过socket服务器向web服务器发送变更通知，web服务器展示的页面提示用户，由用户决定是否重新加载程序，如果是非目标文件，则会自动重新加载
* 当用户选择加载之后，则将代码从目标文件处写入本项目的output.rb中，并将该内容发送给sketchup执行eval运行代码


在sketchup中打开ruby控制台，将本项目地址加入到LOAD_PATH中
在ruby中执行skpsrc/SkpDev/skpdev.rb文件启动插件
