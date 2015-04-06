var $ = require('jquery.js'),
	_ = require('lodash'),
	app = require('ampersand-app'),
	QuestionModel = require('models/question.js'),
	BaseView = require('ampersand-view'),
	handlebars = require('handlebars.js'),
	template = require('templates/question-show-admin.hbs');

var GroupOrganization = BaseView.extend({

	template: handlebars.compile(template),

	events: {
		'click .remove-answer': 'removeAnswer',
		'click .remove-member': 'removeMember',
		'click .remove-all-member': 'removeAllMembers',
		'click .publish-groups': 'publishGroups',
		'click .group-name': 'changeGroupName',
		'keyup .group-count': 'changeGroupCount',
		'click .randomize-groups': 'randomizeGroups',
		// d&d events
		'dragstart li[draggable]': 'dragStart',
		'dragend li[draggable]': 'dragEnd',
		'dragenter .drag-target': 'dragEnter',
		'dragover .drag-target': 'dragOver',
		'dragleave .drag-target': 'dragLeave',
		'drop .drag-target': 'dragDrop',
	},

	initialize: function(){},

	removeAnswer: function(e){
		var $el = $(e.target).closest('li'),
			id = $el.attr('data-id');

		if( $el && id ){
			this.model.removeAnswer(id);
			this.model.save();
			this.render();
		}
	},

	removeMember: function(e){
		var $el = $(e.target),
			memberId = $el.closest('li.member').attr('data-id'),
			member = this.model.getAnswer(memberId),
			groupId = $el.closest('li.group').attr('data-id'),
			group = this.model.groups.get(groupId);

		if(member && group){
			group.removeMember(member.id);
			this.model.save();
			this.render();
		}
	},

	removeAllMembers: function(){
		this.model.groups.removeAllMembers();
		this.model.save();
		this.render();
	},

	publishGroups: function(){
		this.model.save();
		this.model.publishGroups();
	},

	changeGroupCount: function(e){
		var $el = $(e.target),
			val = $el.val(),
			intVal = parseInt(val, 10);

		if( !_.isNaN(intVal) ){
			if(intVal > this.model.answers.length){
				intVal = this.model.answers.length;
			}
			this.model.groups.setCount(intVal);
			this.model.save();
			this.render();
		}

	},

	randomizeGroups: function(){
		this.model.groups.randomize(this.model.answers);
		this.model.save();
		this.render();
	},

	dragStart: function(e){
		var $el = $(e.target),
			id = $el.closest('li').attr('data-id');

		this.dragSourceId = id;
		e.dataTransfer.setData('text/html', id);
	},

	dragEnter: function(e){
		var $closestElement = $(e.target).closest('.drag-target');

		if($closestElement.length){
			$closestElement.addClass('drag-enter');
		}
	},

	dragOver: function(e){
		if (e.preventDefault) {
			e.preventDefault();
		}

		var $closestTarget = $(e.target).closest('.drag-target'),
			groupId = $closestTarget.attr('data-id'),
			memberId = this.dragSourceId,
			group = this.model.groups.get(groupId),
			member = this.model.getAnswer(memberId);

		if( $closestTarget.length ){
			$closestTarget.addClass('drag-enter');
			
			if( group && member && group.hasMember(memberId) ){
				$closestTarget.addClass('not-allowed');
			}
		}

		return false;
	},

	dragLeave: function(e){
		var $closestTarget = $(e.target).closest('.drag-target');
		
		if( $(e.currentTarget).closest('.drag-target').length === 0 ){
			$closestTarget.removeClass('drag-enter');
			$closestTarget.removeClass('not-allowed');
		}
	},

	dragDrop: function(e){
		var $closestTarget = $(e.target).closest('.drag-target'),
			AnswerId = e.dataTransfer.getData('text/html'),
			GroupId = $closestTarget.attr('data-id'),
			group = this.model.groups.get(GroupId),
			member = this.model.getAnswer(AnswerId);

		$closestTarget.removeClass('drag-enter');
		$closestTarget.removeClass('not-allowed');

		if( group && member && !group.hasMember(AnswerId) ){
			group.addMember(member);
			this.model.save();
			this.render();
		}
	},

	dragEnd: function(e){},

	changeGroupName: function(e){
		var $el = $(e.target),
			val = $el.html(),
			self = this;

		$el.html('<input id="change-group-name" type="text" value="'+val+'"/>');
		$('#change-group-name').select();

		$('#change-group-name').keyup(function(e){
			var $li = $(e.currentTarget).closest('li'),
				GroupId = $li.attr('data-id'),
				group = self.model.groups.get(GroupId);

			// ENTER
			if ( e.keyCode == 13 ){
				group.name = $(this).val();
				closeField();
			// ESC
			}else if( e.keyCode == 27 ){
				closeField();
			}

			function closeField(){
				$li.find('.group-name').html( group.name );
			}

		});
	}

});

module.exports = GroupOrganization;