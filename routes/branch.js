var User = require('../models/User');
var Novel = require('../models/Novel');
var Branch = require('../models/Branch');
var Script = require('../models/Script');
var async = require('async');
var logger = require('../lib/logger').trace;



exports.show = function(req, res, next) {
	var branch_id = req.params.branch_id;

	Branch.findById(branch_id).populate('novel scripts owner').exec(function(err, branch) {
		if (err) return next(err);
		res.render('branch/show', {branch: branch});
	});
}


/*
 * 브랜치 끝에 스크립트를 추가함
 * 만약 마지막 스크립트가 close 상태라면 챕터를 올리고 브랜치 새로따고 추가
 */

exports.write = function(req, res, next) {

	if(req.session.user == null) {
		return next('로그인해라');
	}

	var branch_id = req.params.branch_id;
	var text = req.body.text;		

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
		// 실제 로직....
		function(user, branch, callback) {

			// if(branch.type === 'private' && branch.owner_id !== user._id) {
			// 	return callback('넌 권한이 없어');
			// }

			var script = new Script({text:text});
			script.owner = user;
			script.p_branch = branch;

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


