var multer = require('multer'),
    ensureAuthenticated = require('../lib/authentication.js').ensureAuthenticated,
    upload = multer({ dest: 'public/images'});



var postHandler = function homeRoute(req, res){
  var file = req.file
  
  if(!file){
    return res.status(400).json({ error: 'no file attached' });
  }

  res.status(200).json({ path: file.path.replace('public', '') });
};

module.exports = function(router){
  router.post('/:session/upload/image', ensureAuthenticated, upload.single('image'), postHandler);
};
