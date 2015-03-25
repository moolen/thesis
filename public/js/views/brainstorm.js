var BaseView = require('./base.js');

var BrainstormView = function( context ){
	BaseView.call(this, context);
};

BrainstormView.prototype = Object.create(BaseView.prototype);

module.exports = BrainstormView;