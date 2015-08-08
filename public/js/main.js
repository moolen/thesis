
var $ = require('./vendor/jquery.js'),
    Application = require('./application.js');

window.$ = $;
window.jQuery = $;

Application.initialize();

window.app = Application;
