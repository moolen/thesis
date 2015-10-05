var	app = require('ampersand-app'),
	GroupModel = require('models/group'),
	uuid = require('lib/uuid.js'),
	_ = require('lodash');

var CanvasGroup = GroupModel.extend({

	highlightColor: '#f00',
	ctx: null,
	isAnimating: false,
	animationCallback: null,

	props: {
		cx: {
			type: 'number',
			default: 10
		},
		cy: {
			type: 'number',
			default: 10
		},
		r: {
			type: 'number',
			default: 5
		},
		id: 'string',
		name: 'string',
		members: 'array'
	},

	initialize: function(model, options){
		if( model.name ){
			this.name = model.name;
		}

		if( model.id ){
			this.id = model.id;
		}
	}
});

module.exports = CanvasGroup;