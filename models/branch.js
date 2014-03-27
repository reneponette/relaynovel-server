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

schema.methods.isSame = function(branch_id) {

  return this._id+'' == branch_id+'';
}

schema.methods.isWritable = function(user) {
  if(user == null) return false;

  return this.type != 'private' || this.owner._id+'' == user._id+'';
}

// schema.methods.chapterBranches = function(cb) {
//   traverseBranch(this, this, function(err, array) {
//     if(err) return cb(err);
//     cb(null, array);
//   });
// }


// var traverseBranch = function(branch, orig_branch, cb) {

//   if(branch.chapter != orig_branch.chapter) {
//     cb(null, []);
//     return;
//   }

//   if(branch.p_branch == null) {
//     cb(null, [branch]); 
//     return;
//   }

//   mongoose.model('Branch', schema).findById(branch.p_branch).populate('scripts').exec(function(err, parent) {
//     if(err==null && parent != null) {
//       traverseBranch(parent, orig_branch, function(err, array) {
//         array.push(branch);
//         cb(null, array);        
//       });
//     }
//   });
// }


// schema.methods.chapterBranches = function(cb) {
//   this.traverseBranch(this.target_chapter, function(err, array) {
//     if(err) return cb(err);
//     cb(null, array);
//   });
// }


// schema.methods.traverseBranch = function(target_chapter, cb) {

//   if(this.chapter != target_chapter) {
//     cb(null, []);
//     return;
//   }

//   if(this.p_branch == null) {
//     cb(null, [this]); 
//     return;
//   }

//   this.model('Branch').findById(this.p_branch).populate('scripts').exec(function(err, parent) {
//     if(err==null && parent != null) {
//       parent.traverseBranch(target_chapter, function(err, array) {
//         array.push(this);
//         cb(null, array);        
//       });
//     }
//   });
// }


module.exports = mongoose.model('Branch', schema);