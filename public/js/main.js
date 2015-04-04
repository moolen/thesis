window.LiveReloadOptions = { host: 'localhost' };

var $ = require('./vendor/jquery.js'),
	Application = require('./application.js'),
	livereload = require('livereload-js');

Application.initialize();

window.app = Application;