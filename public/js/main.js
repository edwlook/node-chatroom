var helper = {
			bold: function(str) {return '<b>' + str + '</b>';}
}
var socket;

var online = document.getElementById('online'),
	userList = document.getElementById('userList'),
	loginForm = document.getElementById('loginForm'),
	chat = document.getElementById('chat'),
	msgForm = document.getElementById('msgForm'),
	messageBox = document.getElementById('messageBox'),
	msgButton = document.getElementById('msgButton'),
	nick = document.getElementById('nick'),
	field = document.getElementById('field'),
	pw = document.getElementById('pw'),
	sound = new Audio('/sound/chat.mp3');

nick.focus();
var messages = [];

var startListeners = function() {
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

	// socket.on('userDisconnect', function() {
	// 	document.body.innerHTML = "<center><h1>You left the chat.</h1></center>";
	// });
};


var auth = function() {
	//initiates new socket
	socket = io.connect(window.location.origin, {
		'sync disconnect on unload': true
	});
	startListeners();
	var name = nick.value;
	var pass = pw.value;
	if (name.replace(/\s+/g, '') == '') {
		alert('Please enter a name.');
	} else {
		socket.emit('auth', {pass: pass, name: name});
	}
	
};
var join = function() {
		var name = nick.value;
		loginForm.style.display = 'none';
		chat.style.display = 'block';
		field.focus();
		socket.emit('send', {message: helper.bold(name) + ' has joined the chat.'});
		socket.emit('join', {name: name});
};
var sendMsg = function() {
	var msg = field.value;
	var name = nick.value;
	if (msg.replace(/\s+/g, '') == '') {
		return false;
	} else {
		socket.emit('newMessage');
		socket.emit('send', {message: helper.bold(name) + ': ' + msg});
		field.value = '';
	}
};