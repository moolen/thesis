var token = require('../lib/token.js'),
	config = require('../config.js'),
	socketNamespace = require('../lib/socket-namespace.js');

var sessionRoute = function(req, res){
	
	var	url = req.protocol + '://' + config.domain;

	// fetch session from storage
	req.session.get(req.params.session.toUpperCase()).then(function(session){
		// case: session exists
		if(session){
			
			if( !req.isAdmin && !req.signedCookies['user-token'] ){
				res.cookie('user-token', token(24), {
					signed: true,
					path: '/' + req.params.session
				});
			}

			res.render( 'session', {
				session: session,
				layout: 'session',
				isAdmin: req.isAdmin,
				url: url
			});
		// case: session does not exist
		}else{
			res.redirect('/');
		}
	});
};

var createSessionRoute = function(req, res){
	socket = require('../app.js').getSocket();
	
	// create tokens
	var sessionToken = token(),
		adminToken = token(32),
		now = new Date(),
		// in 12 Months
		cookieExpires = new Date( now.getTime() + 1000 * 60 * 60 * 24 * 30 * 12 );

	// create session
    // @todo check sessionToken collision
	req.session.createSession(sessionToken, adminToken);

	socketNamespace.initializeNamespace(socket, sessionToken);

	// set-cookie
	res.cookie('session-token', sessionToken, {
		signed: true,
		expires: cookieExpires,
		path: '/' + sessionToken
	});
	res.cookie('admin-token', adminToken, {
		signed: true,
		expires: cookieExpires,
		path: '/' + sessionToken
	});

	// redirect to active session 
	res.redirect('/' + sessionToken);
};

module.exports = function(router){
	router.get('/create', createSessionRoute);
	router.get('/:session', sessionRoute);
	router.get('/:session/*', sessionRoute);
};
