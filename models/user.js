var mongoose = require('mongoose');


var schema = mongoose.Schema({
	nickname: String,
	email: String,
	password: String,
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});

module.exports = mongoose.model('User', schema);