var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var schema = mongoose.Schema({

	nickname: String,
	profileImg: String,
	
	//facebook
	fbId: String,
	fbToken: String,

  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});

module.exports = mongoose.model('User', schema);