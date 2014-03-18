var mongoose = require('mongoose');


var schema = mongoose.Schema({
	novel: mongoose.Schema.Types.ObjectId,
	chapter: {type: Number, default: 1},
	p_branch: mongoose.Schema.Types.ObjectId, //parent branch
	p_script: mongoose.Schema.Types.ObjectId, //parent script
	owner: mongoose.Schema.Types.ObjectId,
  title: String,
  scripts: Array,
  type: {type: String, default:'private'},
  closed: {type: Boolean, default: false},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Branch', schema);