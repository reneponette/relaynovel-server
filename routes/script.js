var User = require('../models/User');
var Novel = require('../models/Novel');
var Branch = require('../models/Branch');
var Script = require('../models/Script');
var async = require('async');
var logger = require('../lib/logger').trace;


exports.show = function(req, res, next) {
	var script_id = req.params.script_id;

	Script.findById(script_id).exec(function(err, script) {
		if(err) return next(err);

		Script.find().where({p_branch:script.p_branch}).sort('created_at').exec(function(err, rows) {
			if(err) return next(err);

			var scripts = [];
			for(var i in rows) {
				var s = rows[i];
				scripts.push(s);
				if(s._id+'' == script._id+'')
					break;
			}

			res.render('script/show', {
				script:script,
				scripts:scripts
			});
		});
	});	
}


/*
 * 특정 스크립트에 이어서 작성
 * 만약 해당 스크립트가 close 상태라면 챕터를 올림
 */

exports.write = function(req, res, next) {
	
	if(req.session.user == null) {
		return next('로그인해라');
	}

	var script_id = req.params.script_id;
	var text = req.body.text;		

	async.waterfall([
		function(callback) {
			User.findById(req.session.user._id, function(err, user) {
				if(err) return callback(err);
				callback(null, user);
			});	
		},

		function(user, callback) {
			Script.findById(script_id).populate('p_branch').exec(function(err, script) {
				if(err) return callback(err);
				callback(null, user, script);
			})			
		},

		function(user, script, callback) {

			var newScript = new Script({text:text});
			var newBranch = new Branch();			

			newScript.owner = user;
			newScript.p_branch = newBranch;

			newBranch.owner = user;
			newBranch.novel = script.p_branch.novel;
			newBranch.p_branch = script.p_branch;
			newBranch.p_script = script;
			newBranch.scripts.push(newScript);
		
			script.branches.push(newBranch);		

			if(script.type == 'close') {
				newBranch.title = '새로운 브랜치';
				newBranch.p_chapter = script.p_branch;
				newBranch.chapter = script.p_branch.chapter + 1;
			} else {
				//브랜치 중간에 분기 타는경우
				newBranch.title = script.p_branch.title;
				newBranch.chapter = script.p_branch.chapter;
				newBranch.p_chapter = script.p_branch.p_chapter;
				script.type = 'branch'
			}

			script.save(function(err) {
				if(err) return callback(err);
			});
			newBranch.save(function(err) {
				if(err) return callback(err);
			});
			newScript.save(function(err) {
				if(err) return callback(err);
			});			

			callback(null, newBranch);
		}
	],
	function(err, newBranch){
		if(err) return next(err);
		res.redirect('/branches/'+newBranch._id);
	});
}


