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

SessionMemoryAdapter.prototype.set = function( sessionId, key, val ){
	var session = this.get(sessionId);
	if(!session)
		throw "session does not exist";

	session[key] = val;

	return this;
};

SessionMemoryAdapter.prototype.createSession = function(id, adminToken){
	
	global[this.sessionKey].sessions.push({
		id: id,
		adminToken: adminToken,
		users: 1,
		data: {}
	});

	return this;
};

SessionMemoryAdapter.prototype.isAdmin = function(sessionId, adminToken){
	var session = this.get(sessionId);
	if( session && session.adminToken === adminToken ){
		return true
	}
	return false;
};

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

SessionMemoryAdapter.prototype.addQuestion = function(token, question){
	var data = this.getData(token, 'questions') || [];
	data.push(question);
	this.setData(token, 'questions', data);
};

SessionMemoryAdapter.prototype.updateQuestion = function(token, question){
	var data = this.getData(token, 'questions') || [],
		match = _.find(data, function(model){
			return model.id == question.id;
		});

	if(match){
		// writable properties: answers
		match.answers = question.answers;
	}
	this.setData(token, 'questions', data);
};

SessionMemoryAdapter.prototype.removeQuestion = function(token, question){
	var data = this.getData(token, 'questions') || [];
	return _.remove(data, function(model){
		return model.id === question.id;
	});
};

SessionMemoryAdapter.prototype.get = function(sessionId){
	return _.find(global[this.sessionKey].sessions, function(sess){
		return sess.id === sessionId;
	});
};

SessionMemoryAdapter.prototype.setData = function( sessionId, key, data ){
	var session = this.get(sessionId);
	if(!session)
		throw "session does not exist";

	session.data[key] = data;

	return this;
};

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

module.exports = SessionMemoryAdapter;