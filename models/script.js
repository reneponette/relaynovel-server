var mongoose = require('mongoose');


var schema = mongoose.Schema({
	owner: mongoose.Schema.Types.ObjectId,
	p_branch: mongoose.Schema.Types.ObjectId,
  type: {type: String, default: 'text'}, //text, close, branch
  text: String,
  branches: Array,
  report: Number,
  created_at: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Script', schema);