var User = require('../models/User');
var Novel = require('../models/Novel');
var Branch = require('../models/Branch');
var Script = require('../models/Script');
var async = require('async');
var logger = require('../lib/logger').trace;


var traverse_branch = function(target_chapter, branch, orig_branch, cb) {

	if(branch.chapter != target_chapter) {
		cb(null, []);
		return;
	}

	if(branch.p_branch == null) {
		cb(null, [branch]);	
		return
	}

	Branch.findById(branch.p_branch).populate('scripts').exec(function(err, parent) {
		if(err==null && parent != null) {
			traverse_branch(target_chapter, parent, orig_branch, function(err, array) {
				array.push(branch);
				cb(null, array);				
			});
		}
	});
}

var populate_scripts = function(branches) {
	var scripts = [];

	for(var i=0 ; i<branches.length ; i++) {
		var b = branches[i];
		var bNext = branches[i+1];

		for(var j in b.scripts) {
			var s = b.scripts[j];
			scripts.push(s);
			//마지막 브랜치일 경우 그냥 모든 스크립트 추가
			if(bNext === undefined) continue;
			//다음 브랜치로 이동...
			if(s._id+'' == bNext.p_script+'') break;
		}
	}
	return scripts;
}

var make_title = function(branches) {
	if(branches == null || branches.length == 0)
		return '';

	var title = '';
	for(var i=0 ; i<branches.length ; i++) {
		var b = branches[i];
		var bNext = branches[i+1];

		if(i==0) {
			title = b.chapter + '. ' + b.title;
		}	

		if(bNext === undefined) break;

		for(var j=0 ; j<b.scripts.length ; j++) {
			var s = b.scripts[j];

			//다음 브랜치가 이전 브랜치의 몇번째 스크립트의 브랜치인지...
			if(s._id+'' == bNext.p_script+'') {
				title += ('-(' + (j+1) + ':');

				//다음 브랜치가 해당 스크립트의 몇번쨰 브랜치인지...
				for(var k=0 ; s.branches.length ; k++) {
					var sb  = s.branches[k];
					if(sb+'' == bNext._id+'') {
						title += ((k+1) + ')');
						break;
					}
				}
				break;
			}
		}
	}
	return title;
}


exports.show = function(req, res, next) {
	var branch_id = req.params.branch_id;

	Branch.findById(branch_id).populate('novel owner scripts').exec(function(err, branch) {
		if (err) return next(err);

		//ex) 1.시작:$13-#3

		traverse_branch(branch.chapter, branch, branch, function(err, branches) {
			var scripts = populate_scripts(branches);
			res.render('branch/show', {
				branch: branch, 
				scripts:scripts, 
				title:make_title(branches)
			});
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


