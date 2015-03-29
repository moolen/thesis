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
		'model.question': {
			type: 'value',
			hook: 'question'
		},
		'model.type': {
			type: 'value',
			hook: 'type'
		},
	},
	events: {
		'click [data-trigger="create"]': 'save'
	},
	initialize: function(options){},

	save: function(){
		var question = $(this.el).find('[data-hook="question"]').val();
		var type = $(this.el).find('[data-hook="type"]').val();

		this.clearErrors();

		
		var model = new QuestionModel();

		if(type)
			model.type = type;

		if(question)
			model.question = question;

		if( model.isValid() ){
			this.collection.addModel( model );
			events.trigger( events.NEW_QUESTION );
			Router.redirectTo('question/' + model.id);
		}else{
			for( var key in model.validationError){
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