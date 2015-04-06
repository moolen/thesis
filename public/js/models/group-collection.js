var _ = require('lodash'),
	uuid = require('lib/uuid.js'),
	BaseCollection = require('ampersand-collection'),
	GroupModel = require('models/group.js');

module.exports = BaseCollection.extend({
	
	model: GroupModel,
	
	initialize: function(models, options){
	},

	setCount: function(val){

		var diff = this.models.length - val;

		// new count greater than current
		if( diff <= 0 ){
			for(var i = diff; i<0; i++){
				var uid = uuid();
				this.add(new GroupModel({
					name: uid
				}));
			}
		// new count smaller the current
		}else{
			// reset all models
			this.models = [];

			for( var i = 0; i < val; i++ ){
				var uid = uuid();
				this.add(new GroupModel({
					name: uid
				}));
			}
		}

		
	},

	removeAllMembers: function(){
		_.each(this.models, function(model){
			model.members = [];
		});
	},

	randomize: function(members){
		
		var groupCount = this.models.length,
			shuffledMembers, groupedMembers

		// shuffle members
		shuffledMembers = _.shuffle(members);
		groupedMembers =_.groupBy(shuffledMembers, function(member, index, collection){
			return Math.floor(index/(collection.length/groupCount));
		});

		// reset all group's members
		_.each(this.models, function(group, index){
			group.members = groupedMembers[index];
		});
	}
});