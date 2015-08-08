var $ = require('jquery.js'),
    _ = require('lodash'),
    app = require('ampersand-app'),
    QuestionModel = require('models/question.js'),
    BaseView = require('ampersand-view'),
    handlebars = require('handlebars.js'),
    template = require('templates/question-create.hbs');

var CreateQuestion = BaseView.extend({
    
    autoRender: true,

    template: handlebars.compile(template),
    inputHighlight: false,

    bindings: {
        'model.type': {
            type: 'value',
            hook: 'type'
        }
    },

    events: {
        // 'change #question-type': 'updateQuestionType',
        'click .add-option': 'addOption',
        'keydown .mc-answer': 'answerKeyUp',
        'click [data-trigger="create"]': 'save'
    },

    initialize: function(options){
        this.model = new QuestionModel();
        this.model.on('change', this.render.bind(this));
        app.router.navigate('question/new');
    },

    updateQuestionType: function(){
        var val = $(this.el).find('[data-hook="type"]').val(),
            question = $(this.el).find('[data-hook="question"]').val(),
            opts = this.getAcceptedOptions();
        
        this.model.question = question;
        this.model.type = val;

        if( opts && opts.length === 0 && val === 'mc' ){
            this.addOption();
        }

    },

    getQuestion: function(){
        return $(this.el).find('[data-hook="question"]').val();
    },

    getAcceptedOptions: function(){
        var options = [];
        
        _.each($('.mc-answer'), function(node){
            options.push({
                value: $(node).val()
            });
        });

        return _.filter(options, function(el){ return el.value !== ""; });
    },

    addOption: function(){
        this.model.question = this.getQuestion();
        this.model.acceptedOptions = this.getAcceptedOptions();

        this.model.incrementAcceptedOptions();
        this.render();

        var $new = $(this.el).find('.mc-answer').last();

        setTimeout(function(){
            $new.focus();
        }, 0);
    },

    answerKeyUp: function(e){
        if( e.which === 9 ){
            this.addOption();
        }
    },

    save: function(){
        var question = $(this.el).find('[data-hook="question"]').val();
        // @todo find answers, remove duplicates and set em on the model
        var acceptedOptions = this.getAcceptedOptions();
        var type = $(this.el).find('[data-hook="type"]').val();

        this.clearErrors();
        
        if(type)
            this.model.type = type;

        if(question)
            this.model.question = question;

        if(acceptedOptions)
            this.model.acceptedOptions = acceptedOptions;

        if( this.model.isValid() ){
            this.collection.addModel( this.model );
            app.trigger( app.events.NEW_QUESTION );
            app.router.redirectTo('question/' + this.model.id);
            this.remove();
        }else{
            for( var key in this.model.validationError){
                this.queryByHook(key)
                    .classList.add('invalid');
            }
        }

    },

    clearErrors: function(){
        this.queryByHook('question').classList.remove('invalid');
        this.queryByHook('type').classList.remove('invalid');
    },

    render: function(){
        this.renderWithTemplate();
        var $select = $(this.el).find('select'),
            $input = $(this.el).find('input').first(),
            $label = $input.next('label'),
            $type = $(this.el).find('#question-type');

        $select.material_select();
        $type.change(_.bind(this.updateQuestionType, this));
        if( !this.inputHighlight ){
            this.inputHighlight = 'active';
            setTimeout(function(){
                $input.focus();
            }, 0);
        }
        return this;
    }
});

module.exports = CreateQuestion;
