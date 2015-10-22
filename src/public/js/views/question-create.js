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
        'click [data-trigger="create"]': 'save',
        'click [data-trigger="abort"]': 'abort'
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
            var val = $(node).val();
            if( val && options.indexOf(val) === -1 ){
                options.push({
                    value: val
                });
            }
            
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
        switch(e.which){
            case 9:
                var divParent = $(e.target).parent(),
                    wrappingParent = divParent.parent(),
                    idx = divParent.index();

                if(!e.shiftKey && wrappingParent.children().length === (idx+1) ){
                    this.addOption();
                }else{
                    
                    if( idx > 1 ){
                        wrappingParent.eq(idx).focus();
                    }
                }
            break;
            
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
            app.router.redirectTo('/');
            this.remove();
        }else{
            for( var key in this.model.validationError){
                this.queryByHook(key)
                    .classList.add('invalid');
            }
        }

    },

    abort: function(){
        app.trigger( app.events.SHOW_QUESTION );
        app.router.redirectTo('/');
        this.remove();
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

        this.renderSelect($select);
        $(this.el).find('.tooltip').tooltip({delay: 50});
        $type.change(_.bind(this.updateQuestionType, this));
        if( !this.inputHighlight ){
            this.inputHighlight = 'active';
            setTimeout(function(){
                $input.focus();
            }, 0);
        }
        return this;
    },

    renderSelect: function($select){

        var icons = _.reduce($select.find('option'), function(memo, el){
            var icon = $(el).attr('data-icon'),
                tooltip = $(el).attr('data-tooltip'),
                value = $(el).attr('value');

            if(icon && tooltip){
                memo.push({
                    value: value,
                    icon: icon,
                    tooltip: tooltip
                });
            }
            
            return memo;
        }, []);

        $select.material_select();

        var $selectChildren = $select.find('option');
        var $mselect = $select.prev('ul.select-dropdown');
        var $mselectChildren = $mselect.find('li span');
        
        $mselectChildren.each(function(i, el){
            var $el = $(this);
            var val = $selectChildren.eq(i).attr('value');
            var icon = _.findWhere(icons, { value: val });
            if( icon ){
                $el.append('<i class="material-icons tooltip" data-tooltip="'+icon.tooltip+'">'+icon.icon+'</i>');
            }
        });
    }
});

module.exports = CreateQuestion;
