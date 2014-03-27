var User = require('../models/User');
var Novel = require('../models/Novel');
var Branch = require('../models/Branch');
var Script = require('../models/Script');
var async = require('async');
var logger = require('../lib/logger').trace;


exports.show = function(req, res, next) {
	var branch_id = req.params.branch_id;

	async.waterfall([
		function(callback) {
			Branch.findById(branch_id).populate('novel owner scripts').exec(function(err, branch) {
				if (err) return callback(err);
				callback(null, branch);
			});			
		},
		function(branch, callback) {
			branch.chapterScripts(function(err, scripts) {
				if (err) return callback(err);
				callback(null, branch, scripts);
			});
		},
		function(branch, scripts, callback) {
			branch.chapterTitle(function(err, title) {
				if (err) return callback(err);
				callback(null, branch, scripts, title);
			});
		}
	], function(err, branch, scripts, title) {
		if(err) next(err);

		res.render('branch/show', {
			branch: branch, 
			scripts:scripts,
			title:title
		});
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
			Branch.findById(branch_id).populate('owner scripts').exec(function(err, branch) {
				if(err) return callback(err);
				callback(null, user, branch);
			})
		},
		// 실제 로직....
		function(user, branch, callback) {

			if(!branch.isWritable(user)) {
				return callback('넌 권한이 없어');
			}

			var newScript = new Script({text:text});
			newScript.owner = user;

			if(branch.closed) {

				var scripts = branch.scripts;
				var lastScript = scripts[scripts.length-1];

				var newBranch = new Branch();
				newBranch.owner = user;
				newBranch.novel = branch.novel;
				newBranch.p_branch = branch;
				newBranch.p_script = lastScript;
				newBranch.chapter = branch.chapter+1;

				lastScript.branches.push(newBranch);
				lastScript.save(function(err) {
					if(err) return next(err);
				});				

				newScript.p_branch = newBranch;
				newBranch.scripts.push(newScript);
				newBranch.save(function(err) {
					if(err) return callback(err);
				});

			} else {

				newScript.p_branch = branch;
				branch.scripts.push(newScript);
				branch.save(function(err) {
					if(err) return callback(err);
				});
			}

			newScript.save(function(err) {
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




exports.close = function(req, res, next) {
	if(req.session.user == null) {
		return next('로그인해라');
	}

	var branch_id = req.params.branch_id;	
	Branch.findById(branch_id).populate('owner scripts').exec(function(err, branch) {
		if(err) return next(err);
		if(!branch.isMine(req.session.user)) return next('권한이 업씀.');

		var scripts = branch.scripts;
		var lastScript = scripts[scripts.length-1];
		logger.info('lastScript = ' + lastScript);

		lastScript.type = 'close';
		lastScript.save(function(err) {
			if(err) return next(err);
		});

		branch.closed = true;
		branch.save(function(err) {
			if(err) return next(err);
		});

		res.redirect('/branches/'+branch_id);		
	});
}


