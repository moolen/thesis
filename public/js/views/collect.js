var BaseView = require('./base.js');

var CollectView = function( context ){
	BaseView.call(this, context);
};

CollectView.prototype = Object.create(BaseView.prototype);

module.exports = CollectView;