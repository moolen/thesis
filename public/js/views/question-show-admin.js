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

	/**
	 * remove and answer from an SA-Question
	 * @param  {MouseEvent} e
	 * @return {void}
	 */
	removeAnswer: function(e){
		var $el = $(e.target).closest('li'),
			id = $el.attr('data-id');

		if( $el && id ){
			this.model.removeAnswer(id);
			this.model.save();
			this.render();
		}
	},

	/**
	 * remove a member from a group
	 * @param  {MouseEvent} e
	 * @return {void}
	 */
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

	/**
	 * remove all members from all grouos
	 * @return {void}
	 */
	removeAllMembers: function(){
		this.model.groups.removeAllMembers();
		this.model.save();
		this.render();
	},

	/**
	 * save & publish the current group-organization
	 * @return {void}
	 */
	publishGroups: function(){
		this.model.save();
		this.model.publishGroups();
	},

	/**
	 * keyup callback for group-count input-field
	 * @param  {KeyUpEvent} e
	 * @return {void}
	 */
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

	/**
	 * randomize the group members
	 * @return {void}
	 */
	randomizeGroups: function(){
		this.model.groups.randomize(this.model.answers);
		this.model.save();
		this.render();
	},

	/**
	 * dragstart callback
	 * @param  {Event} e
	 * @return {void}
	 */
	dragStart: function(e){
		var $el = $(e.target),
			id = $el.closest('li').attr('data-id');

		this.dragSourceId = id;
		e.dataTransfer.setData('text/html', id);
	},

	/**
	 * dragenter callback
	 * @param  {Event} e
	 * @return {void}
	 */
	dragEnter: function(e){
		var $closestElement = $(e.target).closest('.drag-target');

		if($closestElement.length){
			$closestElement.addClass('drag-enter');
		}
	},

	/**
	 * dragover callback
	 * @param  {Event} e
	 * @return {void}
	 */
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

	/**
	 * dragleave callback
	 * @param  {Event} e
	 * @return {void}
	 */
	dragLeave: function(e){
		var $closestTarget = $(e.target).closest('.drag-target');
		
		if( $(e.currentTarget).closest('.drag-target').length === 0 ){
			$closestTarget.removeClass('drag-enter');
			$closestTarget.removeClass('not-allowed');
		}
	},

	/**
	 * dragdrop callback
	 * @param  {Event} e
	 * @return {void}
	 */
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

	/**
	 * dragend callback
	 * @param  {Event} e
	 * @return {void}
	 */
	dragEnd: function(e){},

	/**
	 * change the group name
	 * - display input field
	 * - bind events
	 * 
	 * @todo  refactor
	 * @param  {MousEvent} e
	 * @return {void}
	 */
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