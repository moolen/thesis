var $ = require('jquery.js'),
    ListItem = require('views/question-show.js'),
    app = require('ampersand-app'),
    BaseView = require('ampersand-view'),
    handlebars = require('handlebars.js'),
    template = require('templates/question-list.hbs');

var QuestionList = BaseView.extend({
    template: handlebars.compile(template),
    
    initialize: function(options){
        this.config = app.config;
        this.collection.on('change', this.updatePlaceholder, this);
    },

    render: function(){
        this.renderWithTemplate();
        this.renderCollection(
            this.collection,
            ListItem,
            '.question-list'
        );

        this.updatePlaceholder();
        return this;
    },

    updatePlaceholder: function(){
        if( this.collection.models.length > 0){
            $(this.el).find('.no-items-placeholder').hide();
        }else{
            $(this.el).find('.no-items-placeholder').show();
        }
    },

    hide: function(){
        var $el = $(this.el).find('.question-list');

        $el.addClass('animate-top');
        $el.animate({ height: 0 }, 700, function(){
            $(this).hide();
        });

    },

    show: function(){
        var $el = $(this.el).find('.question-list');
        $el.show();
        $el.removeClass('animate-top');
        $el.css('height', 'auto');
    }
});

module.exports = QuestionList;