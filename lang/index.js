var fs = require('fs'),
	path = require('path'),
	lang = {
		available: [],
		translation: {}
	};

// require files from current dir 
fs.readdirSync(__dirname).filter(function(file){
	// not /.(.*)/ and index.js
	return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file){
	
	var baseName = file.replace('.js', '');
	lang.available.push( baseName );
	lang.translation[baseName] = require(path.join(__dirname, file));
});

module.exports = lang;

module.exports.helper = function( LANG ){
	return lang.translation[LANG];
};