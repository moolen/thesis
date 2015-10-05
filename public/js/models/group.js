var State = require('ampersand-state'),
	app = require('ampersand-app'),
	uuid = require('lib/uuid.js'),
	_ = require('lodash');

var GroupModel = State.extend({
	
	props: {
		id: 'string',
		name: 'string',
		members: 'array'
	},
	
	initialize: function(props){
		props = props || {};
		
		if(!props.members)
			this.members = [];
		if(!props.id)
			this.id = uuid();
	},
	
	resetMembers: function(){
		this.members = [];
	},

	hasMember: function(id){
		return _.find(this.members, function(member){
			return member.id == id;
		});
	},
	
	addMember: function(member){
		this.members.push(member);
	},

	removeMember: function(id){
		return _.remove(this.members, function(member){
			return member.id === id;
		});
	}
});

module.exports = GroupModel;
