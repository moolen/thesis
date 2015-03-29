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
			//	'data': {}
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

SessionMemoryAdapter.prototype.setData = function( sessionId, key, data ){
	var session = this.get(sessionId);
	if(!session)
		throw "session does not exist";

	session.data[key] = data;

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

SessionMemoryAdapter.prototype.get = function(sessionId){
	return _.find(global[this.sessionKey].sessions, function(sess){
		return sess.id === sessionId;
	});
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