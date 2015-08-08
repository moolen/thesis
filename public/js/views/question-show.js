var $ = require('jquery.js'),
	app = require('ampersand-app'),
	BaseView = require('ampersand-view'),
	AdminDetailView = require('views/question-show-admin.js'),
	GroupModel = require('models/group.js'),
	handlebars = require('lib/hbs-helper.js'),
	template = require('templates/question-show.hbs');

var ShowQuestion = BaseView.extend({

	autoRender: true,

	dragSourceId: null,

	events: {
		'click .submit-answer': 'submitAnswer'
	},

	template: handlebars.compile(template),

	bindings: {
		'model.question': {
			type: 'value',
			hook: 'question'
		}
	},

	initialize: function(options){
		this.config = app.config;
		this.model.on('change', this.render.bind(this));
		app.router.navigate('question/' + this.model.id);
	},

	/**
	 * renders template,
	 * renders adminView if user is admin
	 * @return {ShowQuestionView}
	 */
	render: function(){
		this.renderWithTemplate();

		if( app.config.isAdmin ){
			this.renderSubview(
				new AdminDetailView({
					model: this.model
				}),
				'.question-detail'
			);
		}
		$(this.el).find('select').material_select();
		return this;
	},

	/**
	 * submit the answer
	 * - look for the appropriate input-field
	 * - tell the model the change
	 * @return {void}
	 */
	submitAnswer: function(){
		var $el, val;

		if( this.model.type == 'sa' || this.model.type == 'go' ){
			$el = $(this.el).find('input[name="question"]');
			val = $el.val();
		}else{
			$el = $(this.el).find('input[name="question"]:checked');
			val = $el.val();
		}

		if( $el.length > 0 && val ){
			this.model.submitted = true;
			this.model.submitAnswer( val );
		}
	}

});

module.exports = ShowQuestion;