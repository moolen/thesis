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
        if( !_.findWhere(this.members, {id: member.id}) ){
            this.members.push(member);
        }
	},

    addMemberExclusively: function(member){
        var found = _.find(this.members, function(el){
            return el.id === member.id;
        });

        if( !found ){
            this.addMember(member);
            return true;
        }
        return false;
    },

	getMembers: function(){
		return this.members;
	},

    getMembersAsObject: function(){
        return _.map(this.members, function(el){
            return {
                title: el,
                x: 0,
                y: 0
            };
        });
    },

	removeMember: function(id){
		return _.remove(this.members, function(member){
			return member.id === id;
		});
	}
});

module.exports = GroupModel;
