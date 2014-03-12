
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var lessMiddleware = require('less-middleware');
var mysql = require('mysql2');

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

// app.set('mysql', mysql.createConnection({
// 	host: app.get('mysql_host'),
// 	port: 3307,
// 	user: 'relaynovel',
// 	password: '77977797'
// }));

var routes = require('./routes');
var user = require('./routes/user');
var novel = require('./routes/novel');

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/novels', novel.list);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
