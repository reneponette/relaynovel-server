var User = require('../models/User');
var async = require('async');
var logger = require('../lib/logger').trace;

/*
 * GET users listing.
 */
exports.list = function(req, res) {
	User.find().exec(function(err, docs) {
		if(err) return res.next(err);

		res.render('user/index', {
			title: 'User List',
			users: docs
		});
	});
  // res.send("respond with a resource");
};

exports.new = function(req, res) {
	res.render('user/_form');
}

/*
 * CREATE user.
 */
exports.create = function(req, res, next) {
	var email = req.body.email;
	var password = req.body.password;
	var nickname = req.body.nickname;
	logger.info('email = ' + email);
	logger.info('password = ' + password);
	logger.info('nickname = ' + nickname);

	async.waterfall([
		//기존 유저 있는지 검사
		function(callback) {
			User.findOne({email:email}, function(err, user) {
				if(err) return callback(err);
				callback(null, user);
			});
		},
		function(user, callback) {
			if(user == null) {
				//유저 생성
				user = new User({
					email:email,
					password:password,
					nickname:nickname
				});
				user.save(function(err) {
					if(err) return callback(err);
					callback(null);
				});				
			} else {
				callback('이메일 이미존재함')
			}
		}
	],
	function(err, results) {
		if(err) {
			console.log(err);
			return next(err);
		}
		res.redirect('/novels');
	});
};


//-----------------------------------------

exports.login = function(req, res, next) {
	var	fbToken = req.body.fbToken;	
	var fbUser = req.body.fbUser;

	async.waterfall([
		function(callback) {
			User.findOne({fbId:fbUser.id}, function(err, user) {
				if(err) return callback(err);
				callback(null, user);
			});
		},
		function(user, callback) {
			if(!user) {
				user = new User({
					fbToken:fbToken,
					fbId:fbUser.id
				});
			}
			user.nickname = fbUser.name;
			user.profileImg = 'http://graph.facebook.com/' + fbUser.id + '/picture';

			req.session.user = user;

			user.save(function(err) {
				if(err) return next(err);
				callback(null);
			});
		}
	],
	function(err, results) {
		if(err) {
			console.log(err);
			return next(err);
		}
		res.json({code:0});
	});
};


exports.logout = function(req, res, next) {
	req.session.user = null;
	res.redirect('back');
}
