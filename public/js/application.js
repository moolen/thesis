var	io = require('./vendor/io.js'),
	$ = require('./vendor/jquery.js'),
	EventEmitter = require('backbone-events-standalone');

var Application = function(){
	
	this.events = EventEmitter;
	this.socket = io.connect( window.config.url + '/' + window.config.room);

	this.socket.on('usercount:update', function(count){
		$('.js-user-count').html(count);
	});

	if( config.isAdmin ){
		(require('./master.js')).call(this);
	}else{
		(require('./slave.js')).call(this);
	}
};

module.exports = Application;