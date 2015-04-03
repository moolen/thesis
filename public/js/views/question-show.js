var $ = require('jquery.js'),
	app = require('ampersand-app'),
	BaseView = require('ampersand-view'),
	handlebars = require('lib/hbs-helper.js'),
	template = require('templates/question-show.hbs');

var ShowQuestion = BaseView.extend({

	autoRender: true,

	events: {
		'click .submit-answer': 'submitAnswer'
	},

	template: handlebars.compile(template),

	bindings: {
		'model.question': {
			type: 'value',
			hook: 'question'
		}
	},
	initialize: function(options){
		this.config = options.config;
		this.model.on('change', this.render.bind(this));
		app.router.navigate('question/' + this.model.id);
	},

	submitAnswer: function(){
		var $el = $('input[name="question"]:checked');
		if( $el.length > 0 ){
			this.model.submitted = true;
			this.model.submitAnswer( $el.val() );
		}
	}
});

module.exports = ShowQuestion;