
/**
 * middleware
 * - checks whether the session-token and admin-token exists and is valid
 * - sets req.isAdmin
 */
module.exports = {
  middleware: function(req, res, next){
    
    var session = req.signedCookies['session-token'],
        admin = req.signedCookies['admin-token'];

    req.session.isAdmin(session, admin).then(function(provenAdmin){
        req.isAdmin = provenAdmin;
        next();
    }).catch(function(e){
        req.isAdmin = false;
        next();
    });
  },
  ensureAuthenticated: function(req, res, next){
    if( req.isAdmin ){
      return next();
    }
    res.status(401).json({ error: "not authenticated"});
  }
};