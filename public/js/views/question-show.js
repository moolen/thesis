var $ = require('jquery.js'),
	app = require('ampersand-app'),
	BaseView = require('ampersand-view'),
	handlebars = require('lib/hbs-helper.js'),
	template = require('templates/question-show.hbs');

var ShowQuestion = BaseView.extend({

	autoRender: true,

	events: {
		'click .submit-answer': 'submitAnswer',
		'click .remove-answer': 'removeAnswer'
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
		var $el, val;

		if( this.model.type == 'sa' ){
			$el = $('input[name="question"]');
			val = $el.val();
		}else{
			$el = $('input[name="question"]:checked');
			val = $el.val();
		}

		if( $el.length > 0 && val ){
			this.model.submitted = true;
			this.model.submitAnswer( val );
		}
	},

	removeAnswer: function(e){

		var $el = $(e.target).closest('li'),
			id = $el.attr('data-id');

		if( $el && id ){
			this.model.removeAnswer(id);
		}

	}

});

module.exports = ShowQuestion;