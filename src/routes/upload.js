var multer = require('multer'),
    ensureAuthenticated = require('../lib/authentication.js').ensureAuthenticated,
    upload = multer({ dest: 'public/images'});



var postHandler = function homeRoute(req, res){
  var file = req.files.image
  res.status(200).json({ path: file.path.replace('public', '') });
};

module.exports = function(router){
  router.post('/:session/upload/image', ensureAuthenticated, upload, postHandler);
};