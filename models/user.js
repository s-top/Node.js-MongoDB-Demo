var mongoose = require('mongoose');
//引入模式这个文件

var UserSchema = require('../schemas/user.js');
var User = mongoose.model('User',UserSchema);

// 将模式导出
module.exports = User;