var Collection = require('ampersand-collection'),
    CanvasGroup = require('models/CanvasGroup.js'),
	GroupCollection = require('models/group-collection.js'),
	app = require('ampersand-app'),
	uuid = require('lib/uuid.js'),
	_ = require('lodash');

var CanvasGroupCollection = GroupCollection.extend({

	model: CanvasGroup,
	numRows: 3,
	nodes: [], //{"name": "Center", "group": 0}
    links: [],
	props: {
		renderContext: 'object'
	},

	initialize: function(models){
	},

    getLinks: function(){
        var links = [];

        for( var i = 1; i < this.models.length; i++){
            var cur = this.models[i];
            for( var j = 0; j < i; j++ ){
                var prev = this.models[j];
                if( prev ){
                    links.push({
                        source: cur,
                        target: prev
                    });
                }
            }
        }
        return links;
    }

});

module.exports = CanvasGroupCollection;