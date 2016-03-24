var State = require('ampersand-state'),
    app = require('ampersand-app'),
    GroupCollection = require('models/group-collection.js'),
    cookie = require('lib/cookie.js'),
    uuid = require('lib/uuid.js'),
    _ = require('lodash');

var colors = ["#f44336", "#03a9f4", "#009688", "#4caf50", "#cddc39", "#ffc107", "#d84315", "#6d4c41", "#2196f3"];

var QuestionModel = State.extend({
    props: {
        id: 'string',
        question: 'string',
        description: 'string',
        image: 'object',
        imageUrl: 'string',
        type: 'string',
        createdAt: 'date',
        acceptedOptions: 'array',
        answers: 'array',
        answered: 'array',
        visible: 'boolean'
    },

    collections: {
        groups: GroupCollection
    },

    session: {
        submitted: {
            type: 'boolean',
            default: false
        },
        submittedAnswer: {
            type: 'object'
        },
        assignedGroup: {
            type: 'string'
        },
        highlight: 'string'
    },

    derived: {
        preparedAnswers: {
            deps: ['answers', 'type'],
            fn: function(){
                var result = [],
                    total = this.answers.length,
                    i = 0,
                    countStrategy = 'value',
                    self = this;

                return _.chain(this.answers)
                    .countBy(countStrategy)
                    .map(function(value, label){
                        i++;
                        return{
                            label: label,
                            color: colors[i % (colors.length - 1)],
                            highlight: '#ddd',
                            value: value
                        };
                    }).value();
            }
        },
        hasAnswered: {
            deps: ['answered'],
            fn: function(){
                return _.indexOf(
                    this.answered, cookie.read('user-token')
                ) !== -1;
            }
        }
    },

    /**
     * initialize: set manadatory props
     * - id, createdAt, answers, answered
     * 
     * @param  {object} props
     * @return {void}
     */
    initialize: function(props){
        props = props || {};

        app.socket.on('group:publish', this.checkAssignedGroups.bind(this));

        if(!props.groups){
            this.groups = new GroupCollection([{name: 'GRP1'}]);
        }

        if(!props.submittedAnswer){
            if( window.localStorage ){
                var item = window.localStorage.getItem('answer' + this.id);
                if(item){
                    this.submittedAnswer = JSON.parse(item);
                    this.checkAssignedGroups();
                }
            }
            
        }

        if(!props.createdAt){
            this.createdAt = new Date();
        }
        
        if(!props.id){
            this.id = uuid();
        }

        if(!props.answers){
            this.answers = [];
        }

        if(!props.answered){
            this.answered = [];
        }
    },

    answerIsInGroup: function(answer){
        return _.find(this.groups.models, function(group){
            return group.hasMember(answer.id);
        }) ? true : false;
    },

    /**
     * look inside the groups collection
     * and search for our submitted Answer
     * if we found it set the assignedGroup property
     * @return {void}
     */
    checkAssignedGroups: function(){
        this.assignedGroup = null;
        if(this.submittedAnswer && this.groups && this.groups.length > 0){
            var self = this;
            _.each(this.groups.models, function(group){
                var found = _.find(group.members, function(member){
                    return member.id === self.submittedAnswer.id;
                });
                if( found ){
                    self.assignedGroup = group.name;
                }
            });
        }
    },
    
    /**
     * increment the acceptedOptions array with an empty value
     * @return {void}
     */
    incrementAcceptedOptions: function(){
        this.acceptedOptions = this.acceptedOptions || [];
        this.acceptedOptions.push({
            value: ''
        });
    },

    /**
     * validate the model:
     * - check question
     * - check type
     * @param  {object} attrs
     * @return {Object}
     */
    validate: function(attrs){
        var errors = {};

        if( !attrs.question || attrs.question.length < 3 ){
            errors.question = true;
        }

        if( !attrs.type || attrs.type.length === 0 ){
            errors.type = true;
        }

        return Object.keys(errors).length === 0 ? null : errors;
    },

    /**
     * submit an answer
     * @param  {String} answer [the answer value]
     * @return {void}
     */
    submitAnswer: function( answer ){


        var answerObject = {
            id: uuid(),
            value: answer
        };

        this.submittedAnswer = answerObject;
        if( window.localStorage ){
            window.localStorage.setItem('answer'+this.id, JSON.stringify(answerObject));
        }

        this.answers = this.answers || [];
        this.answers.push(answerObject);

        // emit answer
        app.socket.emit('answer:submit', {
            user: app.config.userToken,
            question: this.id,
            answer: answerObject
        });
    },

    /**
     * publishes the group-settings
     * @return {void}
     */
    publishGroups: function(){
        app.socket.emit('group:publish', {
            user: app.config.userToken,
            admin: app.config.adminToken,
            groups: this.groups
        });
    },

    /**
     * get an answer by id
     * @param  {uuid} id [id of answer]
     * @return {Object|undefined} the answer object
     */
    getAnswer: function(id){
        return _.find(this.answers, function(answer){
            return answer.id === id;
        });
    },

    /**
     * delete an answer by id
     * 
     * @param  {uuid} id [id of answer]
     * @return {Object|undefined} the removed element
     */
    removeAnswer: function(id){
        var removed = _.remove(this.answers, function(answer){
            return answer.id === id;
        });

        if(removed){
            this.trigger('change');
        }

        // propagate to server
        this.save();
        return removed;
    },

    /**
     * saves this question
     * @return {void}
     */
    save: function(callback){
        callback = callback || function(){};
        app.socket.emit('questions:change', {
            user: app.config.userToken,
            admin: app.config.adminToken,
            model: this.toJSON()
        }, callback);
    },

    uploadImage: function(callback){
        if( this.image ){
            var self = this;
            var data = new FormData();
            data.append('image', this.image);
            $.ajax({
                url: '/' + app.config.room + '/upload/image',
                type: 'POST',
                data: data,
                cache: false,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function(data, status, xhr){
                    if( data && data.path ){
                        self.image = null
                        self.imageUrl = data.path;
                    }
                    callback();
                }
            });
        }else{
            callback();
        }
    },

    remove: function(){
        app.socket.emit('questions:remove', {
            user: app.config.userToken,
            admin: app.config.adminToken,
            model: this.toJSON()
        });
    }
});

module.exports = QuestionModel;