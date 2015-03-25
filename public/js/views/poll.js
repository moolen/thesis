var BaseView = require('./base.js');

var PollView = function( context ){
	BaseView.call(this, context);
};

PollView.prototype = Object.create(BaseView.prototype);

module.exports = PollView;