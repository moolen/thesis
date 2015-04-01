var _ = require('lodash'),
	BaseCollection = require('ampersand-collection'),
	QuestionModel = require('models/question.js');

module.exports = BaseCollection.extend({
	
	model: QuestionModel,
	
	namespace: 'questions',

	comparator: 'createdAt',
	
	initialize: function(models, options){
		var self = this;
		this.socket = options.socket;
		this.socket.on( this.namespace + ':change', function( collection ){
			self.set(collection);
			self.sort();
		});
		
	},

	addModel: function( model ){
		this.socket.emit(this.namespace + ':add', model);
		this.add(model);
	}
});