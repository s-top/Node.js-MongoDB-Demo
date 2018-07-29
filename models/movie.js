var mongoose = require('mongoose');
//引入模式这个文件

var MovieSchema = require('../schemas/movie.js');
var Movie = mongoose.model('Movie',MovieSchema);

// 将模式导出
module.exports = Movie;