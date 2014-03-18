var User = require('../models/User')
var async = require('async')

/*
 * GET users listing.
 */

exports.list = function(req, res) {
	User.find({}, function(err, docs) {
		if(err) return res.next(err);

		res.render('user/index', {
			title: 'User List',
			users: docs
		});
	});
  // res.send("respond with a resource");
};

/*
 * CREATE user.
 */

exports.create = function(req, res, next) {
	var nickname = req.query.nickname;

	async.waterfall([
		//기존 유저 있는지 검사
		function(callback) {
			User.findOne({nickname:nickname}, function(err, user) {
				if(err) return callback(err);

				callback(null, user);
			});
		},
		function(user, callback) {
			console.log('user = ' + JSON.stringify(user));
			if(user == null) {
				//유저 생성
				user = new User({nickname:nickname, password:'7797'});
				user.save();
				callback(null);
			} else {
				callback('닉네임이미존재')
			}
		}
	],
	function(err, results) {
		if(err) {
			console.log(err);
			return next(err);
		}

		res.redirect('/users');		
	});
};


//-----------------------------------------

exports.login = function(req, res, next) {
	var nickname = req.body.nickname;
	var password = req.body.password;

	async.waterfall([
		//기존 유저 있는지 검사
		function(callback) {
			User.findOne({nickname:nickname}, function(err, user) {
				if(err) return callback(err);
				callback(null, user);
			});
		},
		function(user, callback) {
			if(user) {
				if(user.password == password) {
					console.log('user = ' + JSON.stringify(user));					
					req.session.user = user;
					callback(null);
				} else {
					callback('비번틀림');
				}
			} else {
				callback('그런유저없음');
			}
		}
	],
	function(err, results) {
		if(err) {
			console.log(err);
			return next(err);
		}

		res.redirect('back');
	});
};

exports.logout = function(req, res, next) {
	req.session.user = null;
	res.redirect('back');
}
