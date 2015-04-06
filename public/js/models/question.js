var State = require('ampersand-state'),
	app = require('ampersand-app'),
	GroupCollection = require('models/group-collection.js'),
	cookie = require('lib/cookie.js'),
	uuid = require('lib/uuid.js'),
	_ = require('lodash');

var QuestionModel = State.extend({
	props: {
		id: 'string',
		question: 'string',
		type: 'string',
		createdAt: 'date',
		acceptedOptions: 'array',
		answers: 'array',
		answered: 'array'
	},

	collections: {
		groups: GroupCollection
	},

	session: {
		submitted: {
			type: 'boolean',
			default: false
		},
		submittedAnswer: {
			type: 'string'
		},
		assignedGroup: {
			type: 'string'
		},
		highlight: 'string'
	},

	derived: {
		preparedAnswers: {
			deps: ['answers', 'type'],
			fn: function(){
				var result = [],
					total = this.answers.length,
					countStrategy = 'value'
					self = this;

				return _.chain(this.answers)
					.countBy(countStrategy)
					.map(function(value, key){
						return{
							key: key,
							value: value,
							percent: Math.round(value / total * 100)
						};
					}).value();
			}
		},
		hasAnswered: {
			deps: ['answered'],
			fn: function(){
				return _.indexOf(
					this.answered, cookie.read('user-token')
				) !== -1;
			}
		}
	},

	/**
	 * initialize: set manadatory props
	 * - id, createdAt, answers, answered
	 * 
	 * @param  {object} props
	 * @return {void}
	 */
	initialize: function(props){
		props = props || {};

		app.socket.on('group:publish', this.checkAssignedGroups.bind(this));

		if(!props.groups){
			this.groups = new GroupCollection([{name: 'GRP1'}, {name: 'GRP2'}, {name: 'GRP3'}, {name: 'GRP4'}]);
		}

		if(!props.submittedAnswer){
			var item = window.localStorage.getItem('answer' + this.id);
			if(item){
				this.submittedAnswer = item;
			}
		}

		if(!props.createdAt){
			this.createdAt = new Date();
		}
		
		if(!props.id){
			this.id = uuid();
		}

		if(!props.answers){
			this.answers = [];
		}

		if(!props.answered){
			this.answered = [];
		}
	},

	/**
	 * look inside the groups collection
	 * and search for our submitted Answer
	 * if we found it set the assignedGroup property
	 * @return {void}
	 */
	checkAssignedGroups: function(){
		if(this.submittedAnswer && this.groups && this.groups.length > 0){
			var self = this;
			_.each(this.groups.models, function(group){
				var found = _.find(group.members, function(member){
					return member.value === self.submittedAnswer;
				});
				if( found ){
					self.assignedGroup = group.name;
				}
			});
		}
	},
	
	/**
	 * increment the acceptedOptions array with an empty value
	 * @return {void}
	 */
	incrementAcceptedOptions: function(){
		this.acceptedOptions = this.acceptedOptions || [];
		this.acceptedOptions.push({
			value: ''
		});
	},

	/**
	 * validate the model:
	 * - check question
	 * - check type
	 * @param  {object} attrs
	 * @return {Object}
	 */
	validate: function(attrs){
		var errors = {};

		if( !attrs.question || attrs.question.length < 3 ){
			errors.question = true;
		}

		if( !attrs.type || attrs.type.length === 0 ){
			errors.type = true;
		}

		return Object.keys(errors).length === 0 ? null : errors;
	},

	/**
	 * submit an answer
	 * @param  {String} answer [the answer value]
	 * @return {void}
	 */
	submitAnswer: function( answer ){

		window.localStorage.setItem('answer'+this.id, answer);
		this.submittedAnswer = answer;

		var answerObject = {
			id: uuid(),
			value: answer
		};

		this.answers = this.answers || [];
		this.answers.push(answerObject);

		// emit answer
		app.socket.emit('answer:submit', {
			user: app.config.userToken,
			question: this.id,
			answer: answerObject
		});
	},

	/**
	 * publishes the group-settings
	 * @return {void}
	 */
	publishGroups: function(){
		app.socket.emit('group:publish', {
			user: app.config.userToken,
			groups: this.groups
		});
	},

	/**
	 * get an answer by id
	 * @param  {uuid} id [id of answer]
	 * @return {Object|undefined} the answer object
	 */
	getAnswer: function(id){
		return _.find(this.answers, function(answer){
			return answer.id === id;
		});
	},

	/**
	 * delete an answer by id
	 * 
	 * @param  {uuid} id [id of answer]
	 * @return {Object|undefined} the removed element
	 */
	removeAnswer: function(id){
		var removed = _.remove(this.answers, function(answer){
			return answer.id === id;
		});

		if(removed){
			this.trigger('change');
		}

		// propagate to server
		this.save();

		return removed;
	},

	/**
	 * saves this question
	 * @return {void}
	 */
	save: function(){
		app.socket.emit('questions:change', {
			user: app.config.userToken,
			model: this.toJSON()
		});
	}
});

module.exports = QuestionModel;