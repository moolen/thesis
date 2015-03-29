var State = require('ampersand-state'),
	_ = require('lodash');

module.exports = State.extend({
	props: {
		id: {
			type: 'number',
		},
		question: {
			type: 'string',
			default: ''
		},
		type: {
			type: 'string',
			default: ''
		},
		createdAt: {
			type: 'date'
		},
		answers: {
			type: 'array'
		}
	},
	initialize: function(){
		this.createdAt = new Date();
		this.id = parseInt(_.uniqueId(), 10);
	},
	validate: function(attrs){
		var errors = {};

		if( attrs.question.length < 3 ){
			errors.question = true;
		}

		if( attrs.type.length === 0 ){
			errors.type = true;
		}

		return Object.keys(errors).length === 0 ? null : errors;
	}
});