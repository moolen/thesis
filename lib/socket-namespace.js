var session = require('./session-adapter.js').getInstance(),
	config = require('../config.js'),
	cookieParser = require('cookie-parser');

var connectedCount = function(sth){
	return Object.keys(sth.connected).length;
};

var initializeNamespace = function( socket, token ){

	// create new websocket namespace
	var namespace = socket.of('/' + token).on('connection', function(sock){
		
		// when any socket disconnects:
		// emit msg all remaining (sock is null!)
		sock.on('disconnect', function(){
			namespace.emit( 'usercount:change', { count: connectedCount(namespace) });
		});

		// ready event
		// - the client is now ready to run
		sock.on('client:ready', function(cfg){
			
			var adminToken = cookieParser.signedCookie(
				decodeURIComponent(cfg.admin),
				config.cookieSecret
			);

			var isAdmin = session.isAdmin(token, adminToken);

			sock.emit('server:ready', {
				usercount: { count: connectedCount(namespace) },
				questions: session.getData(token, 'questions'),
				activities: session.getData(token, 'activities')
			});		

		});

		sock.on('questions:add', function(model){

			var data = session.getData(token, 'questions') || [];
			data.push(model);
			
			console.log(data);

			session.setData(token, 'questions', data);
			namespace.emit( 'questions:change', data );

		});

		sock.on('answer:submit', function( answerObject ){
			var userToken = cookieParser.signedCookie(
					decodeURIComponent(answerObject.user),
					config.cookieSecret
				),
				questionId = answerObject.question,
				answer = answerObject.answer;

			if( session.hasAnswered(token, questionId, answerObject.user ) ){
				console.log('user has answered');
			}else{
				console.log('user has not answered yet');
				session.addAnswer(token, questionId, answerObject.user, answer);
				namespace.emit( 'questions:change', session.getData(token, 'questions') );
			}

		});

	});

	// emit message to all on each connection
	// to this namespace
	namespace.on('connection', function(){
		namespace.emit( 'usercount:change', { count: connectedCount(namespace) });
	});

};

module.exports.initializeNamespace = initializeNamespace;