var express = require('express');
var router = express.Router();
var User = require('../models/user');
var _ = require('underscore');

var admin = 'stop';
// 报错信息公共函数
function errJSON(err, res) {
    if(!err) {
        res.render('notice', {
            title: '信息提示页面',
            status: '1',
            msg: '请求错误',
            results: '服务器故障'
        });
    } else {
        res.render('notice', {
            title: '信息提示页面',
            status: '1',
            msg: "系统错误",
            results: '服务器故障'
        });
    }
}
//验证登录
function isLogin(req, res) {
    var _user=req.session.user;
    if(typeof(_user) == 'undefined'){
        return res.render('notice', {
            title: '信息提示页面',
            status: '2',
            msg: '请先登录',
            results:''
        });
    }
}
//用户登录
router.post('/login', function(req, res, next) {
    var param = {
        name: req.body.user.name,
        password: req.body.user.password
    };
    User.findOne(param, function(err, user) {
        if(err) {
            res.json(errJSON(err));
        } else {
            if(user) {
                //存在cookie里
                res.cookie('userId', user._Id, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                });
                res.cookie('userName', user.name, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                });
                req.session.user=user;
                res.render('notice', {
                    title: '信息提示页面',
                    status: '0',
                    msg: '登录成功',
                    result:{
                        msg:''
                    }
                });
            } else {
                res.render('notice', {
                    title: '信息提示页面',
                    status: '2',
                    msg: '登录失败',
                    results: '用户信息有误'
                });
            }
        }
    });
});

// 用户注册
router.post('/registe',function(req,res){
    var _user = req.body.user; //拿到表单提交的user数据
    User.findOne({name: _user.name}, function(err, user){//判断用户名是否被占用
        if(err){
            res.json(errJSON(err, res));
        }
        if(user){
            res.render('notice', {
                title: '信息提示页',
                status: '2',
                msg: '注册失败',
                results: '用户已存在'
            });
        }else{
            user = new User(_user); //直接生成用户数据
            user.save(function(err, user){
                if(err){
                    res.json(errJSON(err));
                }
                res.render('notice', {
                    title: '信息提示页面',
                    status: '0',
                    msg: '注册成功',
                    result: {
                        userName: user.name
                    }
                });
            });
        }
    });
});
// 用户列表
router.get('/userslist',function(req,res){
    isLogin(req, res);
    var _user=req.session.user;
    if(_user.name !== admin){
        return res.render('notice', {
            title: '信息提示页面',
            status: '2',
            msg: '非管理员身份无法操作'
        });
    }else{
        User.fetch(function(err,users){
            if(err){
                res.json(errJSON(err, res));
            }
            res.render('Userslist',{
                title:'用户列表页',
                users:users
            });
        });
    }
});
// 用户个人信息跳转
router.get('/:id',function(req,res){
    var id = req.params.id;
    User.findById(id, function(err, user){
        if(err){
            res.json(errJSON(err, res));
        }
        if(user){
            res.render('userInfo',{
                title: user.name,
                users: user
            });
        }
    });
});
// 用户个人信息详情
router.get('/userDetail/:id',function(req,res){
    var id = req.params.id;
    User.findById(id, function(err, user){
        if(err){
            res.json(errJSON(err, res));
        }
        if(user){
            res.render('userDetail',{
                title: user.name,
                users: user
            });
        }
    });
});
// 用户个人信息更新
router.post('/update', function(req, res) {
    var userObj = req.body.user;
    var _user;
    if (typeof(userObj._id) !== 'undefined') {
        User.findById(userObj._id, function(err, user) {
            if (err) {
                res.json(errJSON(err, res));
            }else{
                _user = _.extend(user, userObj);
                _user.save(function(err, user) {
                    if (err) {
                        res.json(errJSON(err));
                    }else{
                        res.render('notice', {
                            title: '信息提示页面',
                            status: '0',
                            msg: '更新信息成功',
                            result: {
                                msg: '请重新登录'
                            }
                        });
                    }
                });
            }
        });
    } else {
        _user = new User({
            name: userObj.name,
            password: userObj.password,
            email:userObj.email,
            meta:{
                createAt:userObj.createAt,
                updateAt:userObj.updateAt
            }
        });
        _user.save(function(err, user) {
            if (err) {
                console.log(err);
            }else{
                res.render('notice', {
                    title: '信息提示页面',
                    status: '0',
                    msg: '更新信息成功',
                    result: {
                        userName: user.name
                    }
                });
            }
        });
    }
});
// 删除用户
router.delete('/delete', function (req, res) {
    isLogin(req, res);
    var id = req.query.id;
    if (id) {
        var _user=req.session.user;
        if(_user.name !== admin){
            res.render('notice', {
                title: '信息提示页面',
                status: '2',
                msg: '非管理员身份无法操作',
                result: {
                    msg: ''
                }
            });
        }else{
            User.findById({_id: id}, function(err, user) {
                if (err) {
                    res.json(errJSON(err, res));
                }else{
                    if(user){
                        if(user.name == admin){
                            res.json({success: 2});
                        }else{
                            User.remove({_id: id}, function (err, user) {
                                if (err) {
                                    res.json(errJSON(err, res));
                                } else {
                                    res.json({success: 0});
                                }
                            });
                        }
                    }
                }
            });
        }
    }else{
        res.json({success: 1});
    }
});

module.exports = router;