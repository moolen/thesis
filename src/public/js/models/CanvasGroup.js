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
		id: 'string',
		name: 'string',
		members: {
            type: 'array',
            default: function(){
                return [];
            }
        }
	},

    session: {
        cx: {
            type: 'number',
            default: 0
        },
        cy: {
            type: 'number',
            default: 0
        },
        x: {
            type: 'number',
            default: 0
        },
        y: {
            type: 'number',
            default: 0
        },
        r: {
            type: 'number',
            default: 5
        },
    },

	initialize: function(model, options){
		if( model.name ){
			this.name = model.name;
		}

		if( model.id ){
			this.id = model.id;
		}

        if( model.members ){
            this.members = model.members;
        }
	}
});

module.exports = CanvasGroup;