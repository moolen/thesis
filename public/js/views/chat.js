var BaseView = require('./base.js');

var ChatView = function( context ){
	BaseView.call(this, context);
};

ChatView.prototype = Object.create(BaseView.prototype);

module.exports = ChatView;