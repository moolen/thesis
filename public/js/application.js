var	io = require('./vendor/io.js'),
	EventEmitter = require('backbone-events-standalone');

module.exports = function(){
	this.events = EventEmitter;
	this.socket = io.connect( window.config.url + '/' + window.config.room);
};