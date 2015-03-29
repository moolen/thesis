var	io = require('io.js'),
	$ = require('jquery.js'),
	_ = require('lodash'),
	events = require('lib/events.js'),
	cookie = require('lib/cookie.js'),
	Router = require('lib/router.js'),
	ViewSwitcher = require('ampersand-view-switcher'),
	QuestionList = require('views/question-list.js'),
	UsercountModel = require('models/user-count.js'),
	CreateQuestionView = require('views/question-create.js'),
	ShowQuestionView = require('views/question-show.js'),
	QuestionCollection = require('models/question-collection.js'),
	ActivityCollection = require('models/activity-collection.js'),
	UsercountView = require('views/user-count.js');

var Application = function(){
	
	var self = this;

	/**
	 * config
	 * - copy the window.config global
	 */
	this.config = _.extend(window.config);

	/**
	 * events
	 * - our application-level eventEmitter instance
	 * @type {EventEmitter}
	 */
	this.events = events;

	/**
	 * socket
	 * - 
	 * @type {Socket.io websocket connection}
	 */
	this.socket = io.connect( this.config.url + '/' + this.config.room);

	/**
	 * MODELS
	 */
	this.models = {};
	this.models.usercount = new UsercountModel({count: 0}, { socket: this.socket });

	/**
	 * COLLECTIONS
	 */
	this.collections = {};

	this.collections.questionCollection = new QuestionCollection(
		[], { socket: this.socket }
	);
	
	this.collections.activityCollection = new ActivityCollection(
		[], { socket: this.socket }
	);

	/**
	 * VIEWS
	 * @type {Object}
	 */
	this.views = {};
	
	/**
	 * viewSwitcher
	 * - toggles showQuestion | createQuestion views
	 */
	this.viewSwitcher = new ViewSwitcher( $('#main')[0] );

	this.views.questionList = new QuestionList({
		el: $('#question-list-view')[0],
		config: self.config,
		collection: this.collections.questionCollection
	});
	
	this.views.usercountView = new UsercountView({
		el: $('.user-count-view')[0],
		config: self.config,
		model: this.models.usercount
	});

	this.router = Router;

	this.initialize = function(){
		this.registerBindings();
		this.socket.on('server:ready', this.onServerReady.bind(this));

		this.socket.emit('client:ready', {
			session: cookie.read('session-token'),
			admin: cookie.read('admin-token')
		});
	};

	this.onServerReady = function( initialData ){
		this.collections.questionCollection.set( initialData.questions, { silent: true } );
		this.collections.activityCollection.set( initialData.activities, { silent: true } );
		this.models.usercount.set( initialData.usercount, { silent: true } );

		this.views.questionList.render();

		this.router.history.start({
			pushState: true,
			root: this.config.room
		});
	};

	this.registerBindings = function(){
		$('.create-question').click(function(){
			if( self.config.isAdmin ){
				self.viewSwitcher.set( new CreateQuestionView({
					el: $('#create-question')[0],
					collection: self.collections.questionCollection
				}));
			}
		});

		this.events.on(events.SHOW_QUESTION, function(id){
			var model = self.collections.questionCollection.get(id);
			if( model ){
				return self.viewSwitcher.set( new ShowQuestionView({
					model: model,
					config: self.config,
					el: $('#show-question')[0]
				}));
			}

			self.router.redirectTo('/');
		});
	};

	this.initialize();

};

module.exports = new Application();