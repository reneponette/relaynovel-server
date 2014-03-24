var mongoose = require('mongoose');


var schema = mongoose.Schema({
  owner_id: mongoose.Schema.Types.ObjectId,  
	novel_id: mongoose.Schema.Types.ObjectId,
	chapter: {type: Number, default: 1},
	p_branch_id: mongoose.Schema.Types.ObjectId, //parent branch
	p_script_id: mongoose.Schema.Types.ObjectId, //parent script
  title: String,
  scripts: Array,
  type: {type: String, default:'private'},
  closed: {type: Boolean, default: false},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Branch', schema);