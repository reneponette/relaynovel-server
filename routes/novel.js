var Novel = require('../models/Novel')
var Branch = require('../models/Branch')
var Script = require('../models/Script')
var async = require('async')

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
	res.render('novel/_form', {
		title: 'New Novel'
	});			
}

exports.create = function(req, res, next) {

	var title = req.body.title;
	var chapter_title = req.body.chapter;
	var script = req.body.script;

	var novel = new Novel({title:title});
	var branch = new Branch({title:chapter_title});
	var script = new Script({text:script});

	novel.owner = req.session.user;
	novel.t_branch = branch;
	branch.owner = req.session.user;
	branch.novel = novel;
	branch.scripts.push(script._id);
	script.p_branch = branch;


	novel.save(function(err) {
		if(err) return next(err);
	});
	branch.save(function(err) {
		if(err) return next(err);
	});
	script.save(function(err) {
		if(err) return next(err);
	});	

	res.redirect('/novels');
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
			Branch.findById(novel.t_branch, function(err, branch) {
				if (err) return callback(err);
				callback(null, novel, branch);
			});
		},
		function(novel, branch, callback) {
			Script.find({p_branch:branch._id}, function(err, scripts) {
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