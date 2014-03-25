var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var schema = Schema({
  owner: {type: Schema.Types.ObjectId, ref: 'User'},
	novel: {type: Schema.Types.ObjectId, ref: 'Novel'},
	chapter: {type: Number, default: 1},
	p_branch: {type: Schema.Types.ObjectId, ref: 'Branch'}, //parent branch
	p_script: {type: Schema.Types.ObjectId, ref: 'Script'}, //parent script
  title: String,
  scripts: [{type: Schema.Types.ObjectId, ref: 'Script'}],
  type: {type: String, default:'private'},
  closed: {type: Boolean, default: false},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});


schema.methods.isMine = function(user) {
  if(user == null) return false;

  return this.owner._id+'' == user._id+'';
}

schema.methods.isWritable = function(user) {
  if(user == null) return false;

  return this.type != 'private' || this.owner._id+'' == user._id+'';
}

module.exports = mongoose.model('Branch', schema);