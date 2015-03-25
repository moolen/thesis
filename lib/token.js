var crypto = require('crypto'),
	encode = require('base64url');

var createToken = function(length){
	length = length || 4;
	return encode( crypto.randomBytes(length) );
}; 

module.exports = createToken;