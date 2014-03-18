var mongoose = require('mongoose');


var schema = mongoose.Schema({
	owner: mongoose.Schema.Types.ObjectId,
    title: String,
    type: {type: String, default: 'private'},
    vote: {type: Number, default: 0},
    synop: String,
    t_branch: mongoose.Schema.Types.ObjectId,
	  created_at: {type: Date, default: Date.now},
	  updated_at: {type: Date, default: Date.now},
});


//instance method
schema.methods.findSimilarTypes = function(cb) {
	this.model('Novel').find({type:this.type}, cb);
}

//model method
schema.statics.findByTitle = function(title, cb) {
	this.find({title: title}, cb);
}

module.exports = mongoose.model('Novel', schema);