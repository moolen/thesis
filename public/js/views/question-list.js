var $ = require('jquery.js'),
	ListItem = require('views/question-show.js'),
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
	},

	removeHighlight: function(){
		this.collection.removeHighlight();
	}
});

module.exports = QuestionList;