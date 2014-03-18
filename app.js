
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var lessMiddleware = require('less-middleware');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
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
app.use(lessMiddleware(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/bower_components')));


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
	app.set('mysql_host', 'localhost');
} else {
	app.set('mysql_host', '');
}


//mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/relaynovel');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});


var routes = require('./routes');
var user = require('./routes/user');
var novel = require('./routes/novel');

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

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
