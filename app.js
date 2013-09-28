
/**
 * Module dependencies.
 */

var express = require('express');

var index = require('./routes');
var login = require('./routes/login.js');

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

app.get('/', index.index);
app.get('/login', login.index);

//Socket.io
/******************************************************/
var online = [];
var users = {};
var pass = '';
if (process.argv[2] == 'prod') {pass = 'hashtagyolo'}

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) {
    //socket.emit('message', { message: 'Welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
    socket.on('auth', function(data) {
        var client = socket.id;
    	if (data.pass === pass) {
            users[data.name] = socket.id;
            socket.name = data.name;
    		io.sockets.socket(client).emit('authSuccess');
            io.sockets.socket(client).emit('message', {message: 'Welcome ' + data.name + '!'});
    	} else {
    		io.sockets.socket(client).emit('authFail');
    	}
    });
    socket.on('join', function(data) {
    	online.push(data.name);
    	io.sockets.emit('updateOnline', users);
    });
    socket.on('disconnect', function() {
  //   	var i = online.indexOf(socket.name);
  //   	if (i > -1) {
  //   		online.splice(i, 1);
		// }
        if (users.hasOwnProperty(socket.name)) {
            delete users[socket.name];
    		io.sockets.emit('message', {message: '<b>' + socket.name + '</b>' + ' has disconnected.'});
        	io.sockets.emit('updateOnline', users);
        }
    });
    socket.on('newMessage', function() {
    	io.sockets.emit('playSound');
    });
});

server.listen(app.get('port'), function() {
	console.log('Server started on port', app.get('port'));
});

