var	io = require('io.js'),
	App = require('ampersand-app'),
	$ = require('jquery.js'),
	_ = require('lodash'),
	cookie = require('lib/cookie.js'),
	Router = require('lib/router.js'),
	ViewSwitcher = require('ampersand-view-switcher'),
	QuestionList = require('views/question-list.js'),
	UsercountModel = require('models/user-count.js'),
	CreateQuestionView = require('views/question-create.js'),
	ShowQuestionView = require('views/question-show.js'),
	QuestionCollection = require('models/question-collection.js'),
	UsercountView = require('views/user-count.js');

var Application = App.extend({

	/**
	 * config
	 * - copy the window.config global
	 */
	config: _.extend(window.config),

	/**
	 * events
	 * - our application-level events hash
	 * @type {object}
	 */
	events: {
		NEW_QUESTION: 'question:created',
		CREATE_QUESTION: 'question:create',
		SHOW_QUESTION: 'question:show',
	},

	/**
	 * socket
	 * - 
	 * @type {Socket.io websocket connection}
	 */
	socket: null,

	/**
	 * MODELS
	 */
	models: {

		/**
		 * usercount model
		 * - populated @server:ready
		 * @type {UsercountModel}
		 */
		usercount: null,

	},

	/**
	 * COLLECTIONS
	 */
	collections: {

		/**
		 * questioCollection
		 * - populated @server:ready
		 * @type {QuestionCollection}
		 */
		questionCollection: null
	},

	/**
	 * VIEWS
	 * @type {Object}
	 */
	views: {
		/**
		 * questionList view
		 * @type {QuestionList}
		 */
		questionList: null,

		/**
		 * usercount view
		 * @type {UsercountView}
		 */
		usercountView: null,
	},
	
	/**
	 * viewSwitcher
	 * - toggles showQuestion | createQuestion views
	 */
	viewSwitcher: new ViewSwitcher( $('#main')[0] ),

	/**
	 * our Application Router
	 * @type {ampersand-router}
	 */
	router: new Router,

	/**
	 * initialize:
	 * - registers DOM bindings,
	 * - registers socket callback 'server:ready'
	 * - read & set admin- & usertoken
	 * - emit socket event 'client:ready'
	 * 
	 * @return {void}
	 */
	initialize: function(){

		this.socket = io('/' + this.config.room);
		
		this.models.usercount = new UsercountModel({count: 0}, { socket: this.socket });
		
		this.collections.questionCollection = new QuestionCollection(
			[], { socket: this.socket }
		);

		this.views.questionList = new QuestionList({
			el: $('#question-list-view')[0],
			config: this.config,
			collection: this.collections.questionCollection
		});

		this.views.usercountView = new UsercountView({
			el: $('.user-count-view')[0],
			config: this.config,
			model: this.models.usercount
		});

		this.registerBindings();
		this.socket.on('server:ready', this.onServerReady.bind(this));

		this.config.adminToken = cookie.read('admin-token');
		this.config.userToken = cookie.read('user-token');

		this.socket.emit('client:ready', {
			session: cookie.read('session-token'),
			admin: cookie.read('admin-token')
		});
	},

	/**
	 * is called when the server tells us he is ready
	 * this is the _last_ part of the initialization process
	 *
	 * - sets the collection data [questions]
	 * - sets the usercount
	 * - renders the question list
	 * - starts the router history
	 * 
	 * @param  {object} initialData [initial data: questions, usercount]
	 * @return {void}
	 */
	onServerReady: function( initialData ){
		this.collections.questionCollection.set( initialData.questions, { silent: true } );
		this.models.usercount.set( initialData.usercount, { silent: true } );

		this.views.questionList.render();

		this.router.history.start({
			pushState: true,
			root: this.config.room
		});
	},

	/**
	 * registers application-level bindings
	 * for handling views
	 * see @createQuestionView and @showQuestionView for actual implementation
	 * 
	 * @return void
	 */
	registerBindings: function(){
		// create question view
		// - via click
		// - via eventEmitter / Router
		$('.create-question').click(this.createQuestionView.bind(this));
		this.on(this.events.CREATE_QUESTION, this.createQuestionView.bind(this));
		
		// show question view
		// - via eventEmitter / Router
		this.on(this.events.SHOW_QUESTION, this.showQuestionView.bind(this));
	},

	/**
	 * createQuestionView:
	 * tells the viewSwitcher to view the <CreateQuestionView>
	 * 
	 * @return void
	 */
	createQuestionView: function(){
		if( this.config.isAdmin ){
			this.views.questionList.removeHighlight();
			return this.viewSwitcher.set( new CreateQuestionView({
				el: $('#create-question')[0],
				collection: this.collections.questionCollection
			}));
		}
		// fallback: root
		this.router.redirectTo('/');
	},

	/**
	 * showQuestionView
	 * pull the question from the collection
	 * and display it in a new view
	 * 
	 * @param  {UUID/Hash} id [the id of the Question]
	 * @return {void}
	 */
	showQuestionView: function(id){
		var model = this.collections.questionCollection.get(id);
		if( model ){
			// set highlighting
			model.highlight = 'active';
			// set view
			return this.viewSwitcher.set( new ShowQuestionView({
				model: model,
				config: this.config,
				el: $('#show-question')[0]
			}));
		}
		// fallback: root
		this.router.redirectTo('/');
	}

});

module.exports = Application;