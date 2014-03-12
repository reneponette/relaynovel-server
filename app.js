
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var lessMiddleware = require('less-middleware');
var orm = require('orm');

var app = express();

//db orm setting
app.use(orm.express("mysql://relaynovel:77977797@localhost/relaynovel", {
	define: function (db, models, next) {
		models.novel = require('./models/novel')(db);
		next();
	}
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
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

var routes = require('./routes');
var user = require('./routes/user');
var novel = require('./routes/novel');

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/novels', novel.list);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
