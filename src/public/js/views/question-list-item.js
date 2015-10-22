var $ = require('jquery.js'),
	app = require('ampersand-app'),
	BaseView = require('ampersand-view'),
	handlebars = require('handlebars.js'),
	template = require('templates/question-list-item.hbs');

var ListItem = BaseView.extend({
	events: {
		'click li': 'showQuestion'
	},
	template: handlebars.compile(template),

	initialize: function(){
		this.model.on('change:highlight', this.render.bind(this));
	},

	showQuestion: function(){
		// this -> collection-view -> list-view -> removeHighlight
		// in some cases? we dont have a parent.parent
		var target = this.parent.parent ? this.parent.parent : this.parent;
		target.removeHighlight();
		if(!this.model.highlight){
			this.model.highlight = 'active';
		}
		
		app.trigger( app.events.SHOW_QUESTION, this.model );
	}
});

module.exports = ListItem;
