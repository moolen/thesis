var _ = require('lodash'),
	instance;

var SessionMemoryAdapter = function( options ){
	
	options = options || {};

	this.sessionKey = options.key || '_sessionStorage';

	// for now we're storing these sessions in memory
	global[this.sessionKey] = {
		sessions: [
			//{
			//	'id': '' // session-token,
			//	'adminToken': '' // admin-token
			//}
		]
	};
};

SessionMemoryAdapter.prototype.set = function( sessionId, key, val ){
	var session = this.getIndex(sessionId);
	if(!session)
		throw "session does not exist";

	session[key] = val;

	return this;
};

SessionMemoryAdapter.prototype.createSession = function(id, adminToken){
	
	global[this.sessionKey].sessions.push({
		id: id,
		adminToken: adminToken
	});


	return this;
};

SessionMemoryAdapter.prototype.exists = function(sessionId, admin){
	var session = this.get(sessionId);
	if( session && session.adminToken === admin ){
		return true
	}
	return false;
};


SessionMemoryAdapter.prototype.get = function(sessionId){
	return _.find(global[this.sessionKey].sessions, function(sess){
		return sess.id === sessionId;
	});
};

module.exports = SessionMemoryAdapter;