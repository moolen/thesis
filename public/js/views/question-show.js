var $ = require('jquery.js'),
	events = require('lib/events.js'),
	Router = require('lib/router.js'),
	QuestionModel = require('models/question.js'),
	BaseView = require('ampersand-view'),
	handlebars = require('handlebars.js'),
	template = require('templates/question-show.hbs');

handlebars.registerHelper('log', function(foo){
	console.log(foo);
});

var ShowQuestion = BaseView.extend({

	autoRender: true,

	template: handlebars.compile(template),

	bindings: {
		'model.question': {
			type: 'value',
			hook: 'question'
		}
	},
	initialize: function(options){
		this.config = options.config;
		Router.navigate('question/' + this.model.id);
	}
});

module.exports = ShowQuestion;