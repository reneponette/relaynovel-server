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

	Novel.find().populate('owner').exec(function(err, novels) {
		if(err) return next(err);

		res.render('novel/index', {
			title: '소설 목록',
			novels: novels
		});
	});	
};


exports.new = function(req, res, next) {
	
	if(req.session.user == null) {
		return next('로그인해라');
	}

	logger.info('user = ' + JSON.stringify(req.session.user));

	res.render('novel/_form', {
		title: '새 소설을 만들자!'
	});			
}

exports.create = function(req, res, next) {

	if(req.session.user == null) {
		return next('로그인해라');
	}

	async.waterfall([
		function(callback) {
			User.findById(req.session.user._id, function(err, user) {
				if(err) return callback(err);
				callback(null, user);
			});	
		},

		function(user, callback) {
			var title = req.body.title;
			var type = req.body.type;
			var backgrounds = req.body.backgrounds;

			var chapter_title = req.body.chapter_title;
			var chapter_type = req.body.chapter_type;
			var chapter_synopsis = req.body.chapter_synopsis;

			var script = req.body.script;

			var novel = new Novel({title:title, type:type, backgrounds:backgrounds});
			var branch = new Branch({title:chapter_title, type:chapter_type, synopsis:chapter_synopsis});
			var script = new Script({text:script});

			novel.owner = user;
			novel.t_branch = branch;

			branch.owner = user;
			branch.novel = novel;
			branch.scripts.push(script._id);

			script.owner = user;
			script.p_branch = branch;

			novel.save(function(err) {
				if(err) return callback(err);
			});
			branch.save(function(err) {
				if(err) return callback(err);
			});
			script.save(function(err) {
				if(err) return callback(err);
			});	

			callback(null);
		}
	],
	function(err, results){
		if(err) return next(err);
		res.redirect('/novels');
	});
}


// exports.show = function(req, res, next) {
// 	var novel_id = req.params.novel_id;

// 	async.waterfall([
// 		function(callback) {
// 			Novel.findById(novel_id, function (err, novel) {
// 				if (err) return callback(err);
// 				callback(null, novel);
// 			});
// 		},
// 		function(novel, callback) {
// 			Branch.findById(novel.t_branch_id, function(err, branch) {
// 				if (err) return callback(err);
// 				callback(null, novel, branch);
// 			});
// 		},
// 		function(novel, branch, callback) {
// 			Script.find({p_branch_id:branch._id}, function(err, scripts) {
// 				if (err) return callback(err);
				
// 				res.render('novel/show', {
// 					novel: novel,
// 					branch: branch,
// 					scripts: scripts
// 				});
// 			});
// 		}
// 	],
// 	function(err, results){
// 		if(err) {
// 			console.log(err);
// 			return next(err);
// 		}
// 	});
// }