
var $ = require('./vendor/jquery.js'),
	_ = require('lodash'),
    Application = require('./application.js');

window.$ = $;
window.jQuery = $;
window._ = _;

var two = require('two.js');

Application.initialize();

window.app = Application;
