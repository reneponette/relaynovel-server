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

	Novel.find({}, function(err, docs) {
		if(err) return next(err);

		res.render('novel/index', {
			title: 'Novel List',
			novels: docs
		});
	});
};


exports.new = function(req, res, next) {
	
	if(req.session.user == null) {
		return next('로그인해라');
	}

	logger.info('user = ' + JSON.stringify(req.session.user));

	res.render('novel/_form', {
		title: 'New Novel'
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
			var chapter_title = req.body.chapter;
			var script = req.body.script;

			var novel = new Novel({title:title});
			var branch = new Branch({title:chapter_title});
			var script = new Script({text:script});

			novel.owner_id = user;
			novel.t_branch_id = branch;

			branch.owner_id = user;
			branch.novel_id = novel;
			branch.scripts.push(script._id);

			script.owner_id = user;
			script.p_branch_id = branch;

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


exports.show = function(req, res, next) {
	var novel_id = req.params.novel_id;

	async.waterfall([
		function(callback) {
			Novel.findById(novel_id, function (err, novel) {
				if (err) return callback(err);
				callback(null, novel);
			});
		},
		function(novel, callback) {
			Branch.findById(novel.t_branch_id, function(err, branch) {
				if (err) return callback(err);
				callback(null, novel, branch);
			});
		},
		function(novel, branch, callback) {
			Script.find({p_branch_id:branch._id}, function(err, scripts) {
				if (err) return callback(err);
				
				res.render('novel/show', {
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