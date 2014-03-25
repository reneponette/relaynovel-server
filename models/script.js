var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
	owner: {type: Schema.Types.ObjectId, ref: 'User'},
	p_branch: {type: Schema.Types.ObjectId, ref: 'Branch'},
  type: {type: String, default: 'text'}, //text, close, branch
  text: String,
  branches: [{type: Schema.Types.ObjectId, ref: 'Branch'}],
  report: Number,
  created_at: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Script', schema);