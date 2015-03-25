
/**
 * middleware
 * - checks whether the session-token and admin-token exists and is valid
 * - sets req.isAdmin
 */
module.exports = function(req, res, next){
	
	var session = req.signedCookies['session-token'],
		admin = req.signedCookies['admin-token'];

	if( true === req.session.exists(session, admin) ){
		req.isAdmin = true;
	}

	next();
};