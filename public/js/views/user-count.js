var $ = require('jquery.js'),
	BaseView = require('ampersand-view'),
	UsercountModel = require('models/user-count.js'),
	handlebars = require('handlebars.js'),
	template = require('templates/user-count.hbs');

var UserCount = BaseView.extend({
	autoRender: true,
	bindings: {
		'model.count': '[data-hook="count"]'
	},
	template: handlebars.compile(template),
	initialize: function(){}
});

module.exports = UserCount;