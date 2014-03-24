var mongoose = require('mongoose');


var schema = mongoose.Schema({
	owner_id: mongoose.Schema.Types.ObjectId,
	t_branch_id: mongoose.Schema.Types.ObjectId,	
  title: String,
  synop: String,
  type: {type: String, default: 'private'},
  vote: {type: Number, default: 0},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});


//instance method
// schema.methods.findSimilarTypes = function(cb) {
// 	this.model('Novel').find({type:this.type}, cb);
// }

schema.methods.getOwner = function(cb) {
	var thisNovel = this;
	this.model('User').findById(this.owner_id, function(err, user) {
		if(user)
			thisNovel.owner = user;
		cb(null, user);
	});
}

//model method
// schema.statics.findByTitle = function(title, cb) {
// 	this.find({title: title}, cb);
// }

schema.statics.getNovels = function(conditions, cb) {
	this.find(conditions, function(err, rows) {
		if(err) return cb(err);

		var count = 0;
		for(var i in rows) {
			var novel = rows[i];
			novel.getOwner(function(err, user) {
				if(++count == rows.length)
					cb(null, rows);
			});
		}		
	});
}

module.exports = mongoose.model('Novel', schema);