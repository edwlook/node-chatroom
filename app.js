
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

//express + socket.io Server
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var online = [];

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) {
    //socket.emit('message', { message: 'Welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
    socket.on('join', function(data) {
    	online.push(data.name);
    	io.sockets.emit('updateOnline', online);
    });
    socket.on('userDisconnect', function(data) {
    	var i = online.indexOf(data.name);
    	if (i > -1) {
    		online.splice(i, 1);
		}
    	io.sockets.emit('updateOnline', online);
    });
});

server.listen(app.get('port'), function() {
	console.log('Server started on port', app.get('port'));
});

