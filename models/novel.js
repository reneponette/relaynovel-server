var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
	owner: { type: Schema.Types.ObjectId, ref: 'User' },
	t_branch: { type: Schema.Types.ObjectId,	ref: 'Branch' },
  title: { type: String, required: true },
 	backgrounds: String, 
  synopsis: String,
  closed: { type: Boolean, default: false },
  type: { type: String, default: 'private' },
  vote: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});


//instance method
// schema.methods.findSimilarTypes = function(cb) {
// 	this.model('Novel').find({type:this.type}, cb);
// }

// schema.methods.getOwner = function(cb) {
// 	var thisNovel = this;
// 	this.model('User').findById(this.owner_id, function(err, user) {
// 		if(user)
// 			thisNovel.owner = user;
// 		cb(null, user);
// 	});
// }

//model method
// schema.statics.findByTitle = function(title, cb) {
// 	this.find({title: title}, cb);
// }

// schema.statics.getNovels = function(conditions, cb) {
// 	this.find(conditions, function(err, rows) {
// 		if(err) return cb(err);

// 		if(rows.length == 0)
// 			return cb(null, rows);

// 		var count = 0;
// 		for(var i in rows) {
// 			var novel = rows[i];
// 			novel.getOwner(function(err, user) {
// 				if(++count == rows.length)
// 					return cb(null, rows);
// 			});
// 		}
// 	});
// }

module.exports = mongoose.model('Novel', schema);