var token = require('../lib/token.js'),
	socketNamespace = require('../lib/socket-namespace.js');

var sessionRoute = function(req, res){
	
	// fetch session from storage
	var session = req.session.get(req.params.session),
		url = req.protocol + '://' + req.get('host');

	// case: session exists
	if(session){
		// case: is admin of session
		if( true === req.isAdmin ){
			res.render( 'session-admin', {
				session: session,
				layout: 'session',
				isAdmin: req.isAdmin,
				url: url
			});
		// case: no admin
		}else{
			res.render( 'session-user', {
				session: session,
				layout: 'session',
				isAdmin: req.isAdmin,
				url: url
			});
		}
	// case: session does not exist
	}else{
		res.redirect('/');
	}
	
};

var createSessionRoute = function(req, res){
	socket = require('../app.js').getSocket();
	
	// create tokens
	var sessionToken = token(),
		adminToken = token(32);

	// create session
	req.session.createSession(sessionToken, adminToken);

	socketNamespace(socket, sessionToken);

	// set-cookie
	res.cookie('session-token', sessionToken, { signed: true });
	res.cookie('admin-token', adminToken, { signed: true });

	// redirect to active session 
	res.redirect('/' + sessionToken);
};

module.exports = function(router){
	router.get('/create', createSessionRoute);
	router.get('/:session', sessionRoute);
};