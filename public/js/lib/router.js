var BaseRouter = require('ampersand-router'),
	events = require('lib/events.js');

var Router = BaseRouter.extend({
	routes: {
		'question/:id': 'question',
		'*any': 'root'
	},
	question: function(id){
		events.trigger(events.SHOW_QUESTION, id)
	},
	root: function(){
		this.navigate('/');
	}
});

module.exports = new Router;