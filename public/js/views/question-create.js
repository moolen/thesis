var $ = require('jquery.js'),
	_ = require('lodash'),
	app = require('ampersand-app'),
	QuestionModel = require('models/question.js'),
	BaseView = require('ampersand-view'),
	handlebars = require('handlebars.js'),
	template = require('templates/question-create.hbs');

var CreateQuestion = BaseView.extend({
	
	autoRender: true,

	template: handlebars.compile(template),

	bindings: {
		'model.type': {
			type: 'value',
			hook: 'type'
		}
	},

	events: {
		'change #question-type': 'updateQuestionType',
		'click .add-option': 'addOption',
		'click [data-trigger="create"]': 'save'
	},

	initialize: function(options){
		this.model = new QuestionModel();
		this.model.on('change', this.render.bind(this));
		app.router.navigate('question/new');
	},

	updateQuestionType: function(){
		var val = $(this.el).find('[data-hook="type"]').val(),
			question = $(this.el).find('[data-hook="question"]').val();
		
		this.model.question = question;
		this.model.type = val;
	},

	getQuestion: function(){
		return $(this.el).find('[data-hook="question"]').val()
	},

	getAcceptedOptions: function(){
		var options = [];
		
		_.each($('.mc-answer'), function(node){
			options.push({
				value: $(node).val()
			});
		});

		return _.filter(options, function(el){ return el.value !== "" });
	},

	addOption: function(){
		this.model.question = this.getQuestion();
		this.model.acceptedOptions = this.getAcceptedOptions();

		this.model.incrementAcceptedOptions();
		this.render();
	},

	save: function(){
		var question = $(this.el).find('[data-hook="question"]').val();
		// @todo find answers, remove duplicates and set em on the model
		var acceptedOptions = this.getAcceptedOptions();
		var type = $(this.el).find('[data-hook="type"]').val();

		this.clearErrors();
		
		if(type)
			this.model.type = type;

		if(question)
			this.model.question = question;

		if(acceptedOptions)
			this.model.acceptedOptions = acceptedOptions;

		if( this.model.isValid() ){
			this.collection.addModel( this.model );
			app.trigger( app.events.NEW_QUESTION );
			app.router.redirectTo('question/' + this.model.id);
		}else{
			for( var key in this.model.validationError){
				this.queryByHook(key)
					.classList.add('error');
			}
		}

	},

	clearErrors: function(){
		this.queryByHook('question').classList.remove('error');
		this.queryByHook('type').classList.remove('error');
	},

	render: function(){
		this.renderWithTemplate();
		return this;
	}
});

module.exports = CreateQuestion;