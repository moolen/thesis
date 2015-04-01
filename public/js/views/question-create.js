var $ = require('jquery.js'),
	events = require('lib/events.js'),
	Router = require('lib/router.js'),
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
		},
	},
	events: {
		'change #question-type': 'updateQuestionType',
		'click .add-option': 'addOption',
		'click [data-trigger="create"]': 'save'
	},
	initialize: function(options){
		this.model = new QuestionModel();
		this.model.on('change', this.render.bind(this));
	},

	updateQuestionType: function(){
		this.model.type = $(this.el).find('[data-hook="type"]').val();
	},

	addOption: function(){
		this.model.incrementAcceptedOptions();
		this.render();
	},

	save: function(){
		var question = $(this.el).find('[data-hook="question"]').val();
		// @todo find answers, remove duplicates and set em on the model
		var acceptedOptions = $(this.el).find('.mc-answer').val();
		var type = $(this.el).find('[data-hook="type"]').val();

		this.clearErrors();

		
		if(type)
			this.model.type = type;

		if(question)
			this.model.question = question;

		if( this.model.isValid() ){
			this.collection.addModel( this.model );
			events.trigger( events.NEW_QUESTION );
			Router.redirectTo('question/' + this.model.id);
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