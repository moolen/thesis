var Collection = require('ampersand-collection'),
	CanvasGroup = require('models/CanvasGroup.js'),
	app = require('ampersand-app'),
	uuid = require('lib/uuid.js'),
	_ = require('lodash');

var CanvasGroupCollection = Collection.extend({

	model: CanvasGroup,
	numRows: 3,
	nodes: [], //{"name": "Center", "group": 0}
	links: [], //{"source":0,"target":1,"value":10},

	props: {
		renderContext: 'object'
	},

	initialize: function(models){
		this.on('change', function(){
			console.log(arguments);
		});
	},

	getNodes: function(){
		return this.models;
	},

	getLinks: function(){
		return this.links;
	}

});

module.exports = CanvasGroupCollection;