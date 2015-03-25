var $ = require('./vendor/jquery.js'),
	PollView = require('./views/poll.js'),
	CollectView = require('./views/collect.js'),
	ChatView = require('./views/chat.js'),
	BrainstormView = require('./views/brainstorm.js');

var MasterApplication = function( context ){

	// save context
	var self = this;

	// log tag
	this.TAG = 'master';

	// selectors
	this.POLL_SELECTOR = '.js-poll';
	this.COLLECT_SELECTOR = '.js-collect';
	this.CHAT_SELECTOR = '.js-chat';
	this.BRAINSTORM_SELECTOR = '.js-brainstorm';

	// view instances
	this.pollView = new PollView(this);
	this.collectView = new CollectView(this);
	this.chatView = new ChatView(this);
	this.brainstormView = new BrainstormView(this);

	this.initialize = function(){
		this.registerBindings();
	};

	this.registerBindings = function(){
		$(this.POLL_SELECTOR).click( this.pollView.show );
		$(this.COLLECT_SELECTOR).click( this.collectView.show );
		$(this.CHAT_SELECTOR).click( this.chatView.show );
		$(this.BRAINSTORM_SELECTOR).click( this.brainstormView.show );
	};

	this.initialize();
};

module.exports = MasterApplication;