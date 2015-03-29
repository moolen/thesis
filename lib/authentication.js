
/**
 * middleware
 * - checks whether the session-token and admin-token exists and is valid
 * - sets req.isAdmin
 */
module.exports = function(req, res, next){
	
	var session = req.signedCookies['session-token'],
		admin = req.signedCookies['admin-token'];

	if( true === req.session.isAdmin(session, admin) ){
		req.isAdmin = true;
	}else{
		req.isAdmin = false;
	}

	next();
};