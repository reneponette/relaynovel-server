
/**
 * Module dependencies.
 */

var config = require('./config');

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var novel = require('./routes/novel');
var branch = require('./routes/branch');

var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
// var logger = require('./lib/logger').logger;
var log4js = require('log4js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(log4js.connectLogger(require('./lib/logger').access, { level: 'auto' }));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '77977797'}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/bower_components')));


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
}

//mongodb
mongoose.connect(config.db.host);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});


app.get('/', routes.index);

//users
app.get('/users', user.list);
app.post('/users/create', user.create);
app.post('/users/login', user.login);
app.get('/users/logout', user.logout);

//novels
app.get('/novels', novel.list);
app.get('/novels/new', novel.new);
app.post('/novels/create', novel.create);
app.get('/novels/:novel_id', novel.show);


app.post('/novels/:novel_id/branches/:branch_id/write', branch.write);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
