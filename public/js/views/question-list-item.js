var $ = require('jquery.js'),
	events = require('lib/events.js'),
	BaseView = require('ampersand-view'),
	handlebars = require('handlebars.js'),
	template = require('templates/question-list-item.hbs');

var ListItem = BaseView.extend({
	events: {
		'click li': 'showQuestion'
	},
	template: handlebars.compile(template),
	showQuestion: function(){
		events.trigger( events.SHOW_QUESTION, this.model );
	}
});

module.exports = ListItem;