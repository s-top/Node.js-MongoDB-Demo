var express = require('express');
var router = express.Router();
var Movie = require('../models/movie');
var _ = require('underscore');

var admin = 'stop';
// 报错信息公共函数
function errJSON(err, res) {
    if(!err) {
        res.render('notice', {
            title: '信息提示页面',
            status: '1',
            msg: '请求错误',
            result: '服务器故障'
        });
    } else {
        res.render('notice', {
            title: '信息提示页面',
            status: '1',
            msg: "系统错误",
            result: '服务器故障'
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
            msg: '请先登录'
        });
    }
}
// 访问统计
var count = 0;
function fc() {
    count++;
    return count;
}
// 电影列表
router.get('/', function(req, res) {
    Movie.fetch(function(err, movies) {
        if (err) {
            res.json(errJSON(err, res));
        }
        res.render('index', {
            title: '视频首页',
            count: fc(),
            movies: movies
        });
    });
});
// 添加电影
router.get('/addMovie', function(req, res) {
    isLogin(req, res);
    var _user=req.session.user;
    if(_user.name !== admin){
        return res.render('notice', {
            title: '信息提示页面',
            status: '2',
            msg: '非管理员身份无法操作'
        });
    }else{
        Movie.fetch(function(err, movies) {
            if (err) {
                res.json(errJSON(err, res));
            }else{
                res.render('addMovie', {
                    title: '添加视频页面'
                });
            }
        });
    }
});
// 创建电影
router.post('/newMovie', function(req, res) {
    isLogin(req, res);
    var _user=req.session.user;
    if(_user.name !== admin){
        return res.render('notice', {
            title: '信息提示页面',
            status: '2',
            msg: '非管理员身份无法操作'
        });
    }else{
        var id = req.body.movie._id;
        var movieObj = req.body.movie;
        var _movie;
        if (typeof(id) !== 'undefined') {
            Movie.findById(id, function(err, movie) {
                if (err) {
                    res.json(errJSON(err, res));
                }
                _movie = _.extend(movie, movieObj);
                _movie.save(function(err, movie) {
                    if (err) {
                        res.json(errJSON(err, res));
                    }else{
                        res.render('notice', {
                            title: '信息提示页面',
                            status: '0',
                            msg: '录入成功',
                            result: {
                                msg: movie.title
                            }
                        });
                    }
                });
            });
        } else {
            _movie = new Movie({
                doctor: movieObj.doctor,
                title: movieObj.title,
                country: movieObj.country,
                language: movieObj.language,
                year: movieObj.year,
                poster: movieObj.poster,
                summary: movieObj.summary,
                flash: movieObj.flash
            });
            _movie.save(function (err, movie) {
                if (err) {
                    res.json(errJSON(err, res));
                } else {
                    res.render('notice', {
                        title: '信息提示页面',
                        status: '0',
                        msg: '录入成功',
                        result: {
                            msg: movie.title
                        }
                    });
                }
            });
        }
    }
});
// 电影详情
router.get('/getOne/:id', function(req, res) {
    isLogin(req, res);
    var id = req.params.id;
    if (id) {
        Movie.findById(id, function(err, movie) {
            if (err) {
                return;
            }
            res.render('detail', {
                title: movie.title,
                movie: movie
            });
        });
    }
});
// 修改更新
router.get('/update/:id', function(req, res) {
    isLogin(req, res);
    var id = req.params.id;
    if (id) {
        Movie.findById(id, function(err, movie) {
            if (err) {
                return;
            }else{
                res.render('updateMovie', {
                    title: movie.title,
                    movie: movie
                });
            }
        });
    }
});
// 电影列表
router.get('/movieList', function(req, res) {
    isLogin(req, res);
    Movie.fetch(function(err, movies) {
        if (err) {
            res.json(errJSON(err, res));
        }else{
            res.render('MovieList', {
                title: '视频列表',
                movies: movies
            });
        }
    });
});
// 11.删除电影
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
            Movie.remove({_id: id}, function (err, movie) {
                if (err) {
                    res.json(errJSON(err, res));
                } else {
                    res.json({success: 0});
                }
            });
        }
    }else{
        res.json({success: 1});
    }
});

module.exports = router;