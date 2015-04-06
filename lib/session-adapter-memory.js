var _ = require('lodash');


var SessionMemoryAdapter = function( options ){
	
	options = options || {};

	this.sessionKey = options.key || '_sessionStorage';

	// for now we're storing these sessions in memory
	global[this.sessionKey] = {
		sessions: [
			//{
			//	'id': '' // session-token,
			//	'adminToken': '' // admin-token,
			//	'users': 0 // user count,
			//	'data': {
			//	  'questions': []
			//	}
			//}
		]
	};
};

/**
 * sets a session
 * @param {string} sessionId [sessions id]
 * @param {string} key       [desired key]
 * @param {mixed} val       [desired value]
 */
SessionMemoryAdapter.prototype.set = function( sessionId, key, val ){
	var session = this.get(sessionId);
	if(!session){
		throw "session does not exist";
	}

	session[key] = val;
	return this;
};

/**
 * returns a session object 
 * @param  {string} sessionId [sessions id]
 * @return {Object}           [the session]
 */
SessionMemoryAdapter.prototype.get = function(sessionId){
	return _.find(global[this.sessionKey].sessions, function(sess){
		return sess.id === sessionId;
	});
};

/**
 * sets data on the session
 * @param {string} sessionId [sessions id]
 * @param {string} key       [desired key]
 * @param {mixed} data      [the data value]
 * @return {this}
 */
SessionMemoryAdapter.prototype.setData = function( sessionId, key, data ){
	var session = this.get(sessionId);
	if(!session)
		throw "session does not exist";

	session.data[key] = data;

	return this;
};

/**
 * session data getter
 * @param  {string} sessionId [sessions id]
 * @param  {string} key       [key of dataattribute]
 * @return {mixed}           [the value for that key]
 */
SessionMemoryAdapter.prototype.getData = function(sessionId, key){
	var session = _.find(global[this.sessionKey].sessions, function(sess){
		return sess.id === sessionId;
	});

	if(!session){
		throw "Session does not exist";
	}

	if(key){
		return session.data[key];
	}

	return session.data;
};

/**
 * creates a session with id and adminToken
 * @param  {string} sessionId  [sessions id]
 * @param  {string} adminToken [admin token]
 * @return {[type]}            [description]
 */
SessionMemoryAdapter.prototype.createSession = function(sessionId, adminToken){
	
	global[this.sessionKey].sessions.push({
		id: sessionId,
		adminToken: adminToken,
		users: 1,
		data: {}
	});

	return this;
};

/**
 * removes a session with a given id
 * @param  {string} id [session id]
 * @return {Object}    [the removed session]
 */
SessionMemoryAdapter.prototype.removeSession = function(id){
	return _.remove(global[this.sessionKey].sessions, function(session){
		return session.id === id;
	});
};

/**
 * validates an adminToken against a session
 * @param  {string}  sessionId  [sessions id]
 * @param  {string}  adminToken [admin token]
 * @return {Boolean}            [if the admin is valid]
 */
SessionMemoryAdapter.prototype.isAdmin = function(sessionId, adminToken){
	var session = this.get(sessionId);
	if( session && session.adminToken === adminToken ){
		return true
	}
	return false;
};

/**
 * checks a usertoken if the user has already answered a question in a session
 * @param  {string}  sessionId  [sessions id]
 * @param  {string}  questionId [questions id]
 * @param  {string}  userToken  [user token]
 * @return {Boolean}            [has answered or not]
 */
SessionMemoryAdapter.prototype.hasAnswered = function(sessionId, questionId, userToken ){
	var	questions = this.getData(sessionId, 'questions');

	var question = _.find(questions, function(question){
		return question.id === questionId;
	});

	if(question){
		var hasAnswered = _.find(question.answered, function(answeredUser){
			return answeredUser == userToken;
		});

		return hasAnswered ? true : false;

	}else{
		throw "Question does not exist";
	}
};

/**
 * adds an answer to a question 
 * @param {string} sessionId  [sessions id]
 * @param {string} questionId [questions id]
 * @param {string} userId     [users id]
 * @param {boolean} answer     [if successful or not]
 */
SessionMemoryAdapter.prototype.addAnswer = function(sessionId, questionId, userId, answer){
	var	questions = this.getData(sessionId, 'questions');

	var question = _.find(questions, function(question){
		return question.id === questionId;
	});

	if( question ){

		question.answered = question.answered || [];
		question.answered.push( userId );

		question.answers = question.answers || [];
		question.answers.push(answer);
		return true;

	}else{
		console.log('addAnswer: Question does not exist.');
		return false;
	}
};

/**
 * adds a question to a session
 * @param {string} sessionId    [sessions id]
 * @param {void}
 */
SessionMemoryAdapter.prototype.addQuestion = function(sessionId, question){
	var data = this.getData(sessionId, 'questions') || [];
	data.push(question);
	this.setData(sessionId, 'questions', data);
};

/**
 * updates a question
 * @param  {string} sessionId    [session id]
 * @param  {Object} question [question object]
 * @return {void}
 */
SessionMemoryAdapter.prototype.updateQuestion = function(sessionId, question){
	var data = this.getData(sessionId, 'questions') || [],
		match = _.find(data, function(model){
			return model.id == question.id;
		});

	if(match){
		// writable properties: answers, groups
		match.answers = question.answers;
		match.groups = question.groups;
	}
	this.setData(sessionId, 'questions', data);
};

/**
 * removes a question from a session
 * @param  {string} sessionId    [sessions id]
 * @param  {Object} question [question Object]
 * @return {Object|undefined}          [returns removed question or undefined]
 */
SessionMemoryAdapter.prototype.removeQuestion = function(sessionId, question){
	var data = this.getData(sessionId, 'questions') || [];
	return _.remove(data, function(model){
		return model.id === question.id;
	});
};

module.exports = SessionMemoryAdapter;