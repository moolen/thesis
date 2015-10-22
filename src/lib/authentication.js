
/**
 * middleware
 * - checks whether the session-token and admin-token exists and is valid
 * - sets req.isAdmin
 */
module.exports = function(req, res, next){
    
    var session = req.signedCookies['session-token'],
        admin = req.signedCookies['admin-token'];

    req.session.isAdmin(session, admin).then(function(provenAdmin){
        req.isAdmin = provenAdmin;
        next();
    }).catch(function(e){
        req.isAdmin = false;
        next();
    });
};