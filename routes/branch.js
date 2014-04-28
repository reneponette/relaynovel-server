var User = require('../models/User');
var Novel = require('../models/Novel');
var Branch = require('../models/Branch');
var Script = require('../models/Script');
var async = require('async');
var logger = require('../lib/logger').trace;


exports.new = function(req, res, next) {
		res.render('branch/_form', {branch_id:req.params.branch_id});
}


/*
 * 주어진 브랜치의 챕터 스크립트를 보여줌
 * 만약 해당 브랜치가 오리지날 챕터 브랜치가 아니라면
 * 오리지널 브랜치가 나올때까지의 모든 브랜치 스크립트를 머지해서 보여줌
 */

exports.show = function(req, res, next) {
	var branch_id = req.params.branch_id;

	async.waterfall([
		function(callback) {
			Branch.findById(branch_id).populate('novel owner scripts p_chapter').exec(function(err, branch) {
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
		},
		function(branch, scripts, title, callback) {
			branch.nextChapters(function(err, nChapters) {
				if(err) return callback(err);

				// prev/next 링크 생성
				var prevLink;
				if(branch.p_chapter) {
					prevLink = {path:'/branches/'+branch.p_chapter._id, class:''};
				} else {
					prevLink = {path:'#', class:'hidden'};
				}
				var nextLink;
				if(nChapters.length>0){
					nextLink = {path:'/branches/'+nChapters[0]._id, class:''};
				} else {
					nextLink = {path:'#', class:'hidden'};
				}

				callback(null, branch, scripts, title, {prev:prevLink, next:nextLink});
			});
		}
	], function(err, branch, scripts, title, links) {
		if(err) return next(err);

		res.render('branch/show', {
			branch: branch, 
			scripts: scripts,
			title: title,
			links: links
		});
	});
}


/*
 * 다음 챕터 브랜치 생성
 */

exports.create = function(req, res, next) {
	if(req.session.user == null) {
		return next('로그인해라');
	}

	var branch_id = req.params.branch_id;
	var title = req.body.title;
	var script = req.body.script;
	var synopsis = req.body.synopsis;

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
		function(user, branch, callback) {

			if(!branch.isWritable(user)) {
				return callback('넌 권한이 없어');
			}

			var newScript = new Script({text:script});
			var scripts = branch.scripts;
			var lastScript = scripts[scripts.length-1];
			var newBranch = new Branch();

			newBranch.owner = user;
			newBranch.novel = branch.novel;
			newBranch.title = title;
			newBranch.synopsis = synopsis;
			newBranch.p_chapter = branch;
			newBranch.p_branch = branch;
			newBranch.p_script = lastScript;
			newBranch.chapter = branch.chapter+1;

			lastScript.branches.push(newBranch);
			lastScript.save(function(err) {
				if(err) return next(err);
			});				

			newBranch.scripts.push(newScript);
			newBranch.save(function(err) {
				if(err) return callback(err);
			});

			newScript.owner = user;
			newScript.p_branch = newBranch;
			newScript.save(function(err) {
				if(err) return callback(err);
			});

			callback(null, newBranch);			
		}
	],
	function(err, newBranch) {
		if(err) return next(err);
		res.redirect('/branches/'+newBranch._id);
	});

}

/*
 * 브랜치의 스크립트 배열 마지막에 스크립트 push
 */

exports.write = function(req, res, next) {

	if(req.session.user == null) {
		return next('로그인해라');
	}

	var branch_id = req.params.branch_id;
	var script = req.body.script;

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

			var newScript = new Script({text:script});
			newScript.owner = user;
			newScript.p_branch = branch;
			branch.scripts.push(newScript);
			branch.save(function(err) {
				if(err) return callback(err);
			});

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


/*
 * 브랜치 완료상태로 변경
 */

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


