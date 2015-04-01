var State = require('ampersand-state'),
	cookie = require('lib/cookie.js'),
	uuid = require('lib/uuid.js'),
	_ = require('lodash');

module.exports = State.extend({
	props: {
		id: {
			type: 'string'
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
		acceptedOptions: {
			type: 'array'
		},
		answers: {
			type: 'array'
		},
		answered: {
			type: 'array'
		}
		
	},

	session: {
		submitted: {
			type: 'boolean',
			default: false
		}
	},

	derived: {
		preparedAnswers: {
			deps: ['answers', 'type'],
			fn: function(){
				var result = [],
					total = this.answers.length,
					countStrategy = undefined
					self = this;

				return _.chain(this.answers)
					.countBy(countStrategy)
					.map(function(value, key){
						return{
							key: key,
							value: value,
							percent: Math.floor(value / total * 100)
						};
					}).value();
			}
		},
		hasAnswered: {
			deps: ['answered'],
			fn: function(){
				return _.indexOf(this.answered, cookie.read('user-token')) !== -1
			}
		}
	},

	initialize: function(props){
		
		props = props || {};

		if(!props.createdAt)
			this.createdAt = new Date();
		
		if(!props.id)
			this.id = uuid();

		if(!props.answers)
			this.answers = [];

		if(!props.answered)
			this.answered = [];
	},

	incrementAcceptedOptions: function(){
		this.acceptedOptions = this.acceptedOptions || [];
		this.acceptedOptions.push({
			value: ''
		});
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
	},

	submitAnswer: function( answer ){
		this.answers = this.answers || [];
		this.answers.push(answer);
		
		// emit answer
		app.socket.emit('answer:submit', {
			user: window.app.config.userToken,
			question: this.id,
			answer: answer
		});
	},
});