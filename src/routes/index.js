var fs = require('fs'),
	path = require('path'),
	express = require('express'),
	router = express.Router();

// require files from current dir 
fs.readdirSync(__dirname).filter(function(file){
	// not /.(.*)/ and index.js
	return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file){
	// require file
	require(path.join(__dirname, file))(router);
});

module.exports = router;