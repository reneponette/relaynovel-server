var User = require('../models/User');
var Novel = require('../models/Novel');
var Branch = require('../models/Branch');
var Script = require('../models/Script');
var async = require('async');
var logger = require('../lib/logger').trace;

/*
 * GET novel list.
 */

exports.list = function(req, res, next) {

	Novel.getNovels({}, function(err, novels) {
		if(err) return next(err);

		res.render('novel/index', {
			title: 'Novel List',
			novels: novels
		});
	});	
};

exports.show = function(req, res, next) {
	var branch_id = req.params.branch_id;


	async.waterfall([
		function(callback) {
			Branch.findById(branch_id, function(err, branch) {
				if (err) return callback(err);

				callback(null, branch);
			});
		},
		function(branch, callback) {
			Novel.findById(branch.novel_id, function (err, novel) {
				if (err) return callback(err);

				callback(null, branch, novel);
			});			
		},
		function(branch, novel, callback) {
			Script.find({p_branch_id:branch._id}, function(err, scripts) {
				if (err) return callback(err);
				
				res.render('branch/show', {
					novel: novel,
					branch: branch,
					scripts: scripts
				});
			});
		}
	],
	function(err, results){
		if(err) {
			console.log(err);
			return next(err);
		}
	});

}


exports.write = function(req, res, next) {

	if(req.session.user == null) {
		return next('로그인해라');
	}

	var branch_id = req.params.branch_id;
	var text = req.body.text;	
	console.log('text = ' + text);

	async.waterfall([
		function(callback) {
			User.findById(req.session.user._id, function(err, user) {
				if(err) return callback(err);
				callback(null, user);
			});	
		},

		function(user, callback) {
			Branch.findById(branch_id, function(err, branch) {
				if(err) return callback(err);
				callback(null, user, branch);
			})
		},

		function(user, branch, callback) {

			console.log('owner_id = ' + branch.owner_id)
			console.log('user_id = ' + user._id)

			// if(branch.type === 'private' && branch.owner_id !== user._id) {
			// 	return callback('넌 권한이 없어');
			// }

			var script = new Script({text:text});
			script.owner_id = user;
			script.p_branch_id = branch;

			branch.scripts.push(script);

			script.save(function(err) {
				if(err) return callback(err);
			});
			branch.save(function(err) {
				if(err) return callback(err);
			});

			callback(null);
		}
	],
	function(err, results){
		if(err) return next(err);
		res.redirect('/branches/'+branch_id);
	});
}


