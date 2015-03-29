var $ = require('jquery.js'),
	events = require('lib/events.js'),
	ListItem = require('views/question-list-item.js'),
	BaseView = require('ampersand-view'),
	handlebars = require('handlebars.js'),
	template = require('templates/question-list.hbs');

var QuestionList = BaseView.extend({
	template: handlebars.compile(template),
	
	initialize: function(options){},

	render: function(){
		this.renderWithTemplate();
		this.renderCollection(
			this.collection,
			ListItem,
			'.question-list'
		);
		return this;
	}
});

module.exports = QuestionList;