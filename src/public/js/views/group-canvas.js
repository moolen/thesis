var $ = require('jquery.js'),
    _ = require('lodash'),
    d3 = require('d3'),
    app = require('ampersand-app'),
    GroupCollection = require('models/CanvasGroupCollection.js'),
    BaseView = require('ampersand-view'),
    handlebars = require('handlebars.js'),
    template = require('templates/group-canvas.hbs');

var GroupCanvas = BaseView.extend({
	
	template: handlebars.compile(template),
	

	initialize: function(){
		
		//this.renderWithTemplate();
		
	},

	

	

	

	highlight: function(x, y){
		console.log('highlight', x, y);
	},

	resetHighlight: function(){
		console.log('reset highlight', x, y);
	},

	onResize: function(){
		
	},

	render: function(){
		this.onResize();
		this.setupContext();
		return this;
	},
});

module.exports = GroupCanvas;