var _ = require('lodash'),
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
				this.add(new GroupModel({
					name: "group-name"
				}));
			}
		// new count smaller the current
		}else{
			// reset all models' members
			// and remove obsolete groups
			_.remove(this.models, function(model, index){
				model.members = [];
				return index >= val;
			});
		}

		this.trigger('change');
	},

	removeAllMembers: function(){
		_.each(this.models, function(model){
			model.members = [];
		});
	},

	randomize: function(members){
		
		var groupCount = this.models.length,
			shuffledMembers, groupedMembers;

		// shuffle members
		shuffledMembers = _.shuffle(members);
		groupedMembers =_.groupBy(shuffledMembers, function(member, index, collection){
			return Math.floor(index/(collection.length/groupCount));
		});

		// reset all group's members
		_.each(this.models, function(group, index){
			group.members = groupedMembers[index];
		});
	},
	addMemberExclusively: function(group, member){
		_.each(this.models, function(model){
			// different group: remove member if existing
			if(model.id !== group.id){
				model.removeMember(member.id);
			}else{
				model.addMember(member);
			}
		});
	}
});