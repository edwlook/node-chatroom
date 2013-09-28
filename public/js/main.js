var helper = {
			bold: function(str) {return '<b>' + str + '</b>';}
		}
var socket = io.connect(window.location.origin, {
	'sync disconnect on unload': true
});
var online = document.getElementById('online');
var userList = document.getElementById('userList');
var loginForm = document.getElementById('loginForm');
var chat = document.getElementById('chat');
var msgForm = document.getElementById('msgForm');
var messageBox = document.getElementById('messageBox');
var msgButton = document.getElementById('msgButton');
var nick = document.getElementById('nick');
var field = document.getElementById('field');
var pw = document.getElementById('pw');
var sound = new Audio('/sound/chat.mp3');
nick.focus();
var messages = [];

socket.on('updateOnline', function(data) {
	var html = '';
	for (var name in data) {
		if (data.hasOwnProperty(name)) {
			html += name + '<br />';
		}
	}		
	userList.innerHTML = html;
});

socket.on('playSound', function() {
	sound.play();
});

var auth = function() {
	var name = nick.value;
	var pass = pw.value;
	socket.emit('auth', {pass: pass, name: name});
};

socket.on('authSuccess', function() {
	join();
	socket.on('message', function (data) {
		if (data.message) {
			messages.push(data.message);
			var html = '';
			for (var i=0; i<messages.length; i++) {
		    	html += messages[i] + '<br />';
			}
			messageBox.innerHTML = html;
			messageBox.scrollTop = messageBox.scrollHeight;
		}
	});
});

socket.on('authFail', function() {
	document.body.innerHTML = "<center><h1>You shouldn't be here.</h1></center>";
	window.setTimeout(function() {
		document.body.innerHTML = "<center><h1>Bye.</h1></center>";
	}, 2000)
	window.setTimeout(function() {
		window.location = "http://www.google.com";
	}, 3000)
});
var join = function() {
		var name = nick.value;
		loginForm.style.display = 'none';
		chat.style.display = 'block';
		field.focus();
		socket.emit('send', {message: helper.bold(name) + ' has joined the chat.'});
		socket.emit('join', {name: name});
};
var sendMsg = function() {
	socket.emit('newMessage');
	var msg = field.value;
	var name = nick.value;
	if (name == '') {
		alert('Please enter a name!');
	} else {
		socket.emit('send', {message: helper.bold(name) + ': ' + msg});
		field.value = '';
	}
};