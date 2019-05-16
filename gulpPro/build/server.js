const express = require('express');
const path = require('path');

const cdr = require('child_process');//子进程模块 http://nodejs.cn/api/child_process.html
const proxy = require('http-proxy-middleware'); //用于把请求代理转发到其他服务器的中间件。 https://www.jianshu.com/p/a248b146c55a

const conf = require('./dev-config');
const debug = require('./utils').debug;
const port = conf.dev.ie8Port || 10000;


// start
const app = express();

//process 进程 node内置模块
console.log(process.env.PORT);

// 设置port到app上
app.set('port',process.env.PORT || port);

// 配制静态文件目录
app.use(express.static(path.resolve(__dirname,'../dest')));

// 将config中的proxy都app.use
conf.dev.proxy.forEach(item =>{
  app.use(proxy(item.pathRules,{
    target:item.target,
    changeOrigin:true,
    logLevel: 'debug',
    logProvider: debug
  }))
})

app.listen(app.get('port'))
// cdr 这个很有用
cdr.exec(`start http://130.10.7.173:${port}`);