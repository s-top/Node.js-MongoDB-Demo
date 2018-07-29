var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var _ = require('underscore');
var port = process.env.PORT || 3002;
// process是个全局变量，用来获取环境中的变量
var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/imooc');
var session=require('express-session');
var cookieParser = require('cookie-parser');
var mongoStore=require('connect-mongo')(session);
mongoose.Promise = require('bluebird');

var User = require('./routes/user');
var Movie = require('./routes/movies');

var app = express();
app.locals.moment = require('moment');
app.set('views', './views/pages');
// 设置视图的根目录
app.set('view engine', 'pug');

// 设置默认的模板引擎
// app.use(express.bodyParser());   过去版语法，现已不支持
app.use(bodyParser.urlencoded({
    extended: true
}));
//上面那个要加extended:true，否则会在post的时候出错
//将表单里的数据进行格式化
// app.use(express.static(path.join(__dirname,'bower_components')));  过去版语法，现已不支持
app.use(serveStatic('bower_components'));
// 设置静态目录，其实就是使view中引入的东西路径正确
app.use(cookieParser());
app.use(session({
    secret: 'haha',
    store:new mongoStore({
        url:'mongodb://localhost:27017/imooc',
        collection:'sessions'
    }),
    resave: false,
    saveUninitialized: true
}));
app.listen(port);
console.log('website started on port: ' + port);

// 0.pre reading
app.use(function(req,res,next){
    var _user=req.session.user;
    if(_user){
        app.locals.user=_user;
    }
    return next();
});

app.use('/user', User);
app.use('/movie', Movie);

// 1.首页路由
app.get('/', function(req, res) {
    res.redirect('/movie');
});
// 登出功能log out
app.get('/logout', function(req, res) {
    delete req.session.user;
    delete app.locals.user;
    res.redirect('/');
});