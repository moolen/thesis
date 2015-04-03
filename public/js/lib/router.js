var BaseRouter = require('ampersand-router'),
	app = require('ampersand-app');

var Router = BaseRouter.extend({
	routes: {
		'question/new': 'questionCreate',
		'question/:id': 'question',
		'*any': 'root'
	},

	question: function(id){
		app.trigger(app.events.SHOW_QUESTION, id);
	},

	questionCreate: function(){
		app.trigger(app.events.CREATE_QUESTION);
	},

	root: function(){
		this.navigate('/');
	}
});

module.exports = Router;