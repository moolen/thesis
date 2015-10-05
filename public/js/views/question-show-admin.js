var $ = require('jquery.js'),
    _ = require('lodash'),
    chartjs = require('chart.js'),
    d3 = require('d3'),
    tipsy = require('jquery.tipsy'),
    app = require('ampersand-app'),
    GroupCanvas = require('views/group-canvas'),
    GroupCollection = require('models/CanvasGroupCollection.js'),
    CanvasGroupCollection = require('models/CanvasGroupCollection'),
    QuestionModel = require('models/question.js'),
    BaseView = require('ampersand-view'),
    handlebars = require('handlebars.js'),
    template = require('templates/question-show-admin.hbs');

var QuestionShowAdmin = BaseView.extend({

    template: handlebars.compile(template),

    ratio: 9/16,
    width: $(window).width() / 2.5,
    height: null,

    context: null,

    events: {
        'click .remove-answer': 'removeAnswer',
        'click .remove-member': 'removeMember',
        'click .remove-all-member': 'removeAllMembers',
        'click .publish-groups': 'publishGroups',
        'click .group-name': 'changeGroupName',
        'change .group-count': 'changeGroupCount',
        'click .randomize-groups': 'randomizeGroups',
        'dragstart [draggable]': 'dragStart',
        'dragenter .dropable': 'dragEnter',
        'dragover .dropable': 'dragOver',
        'dragleave .dropable': 'dragLeave',
        'dragend [draggable]': 'dragEnd',
        'drop .dropable': 'dragDrop'
    },

    initialize: function(){
        this.createCollection();
        this.model.on('change', this.update, this);
    },

    render: function(){
        var self = this;
        this.renderWithTemplate();
        this.$chart = $(this.el).find('.chart-canvas');
        setTimeout(_.bind(this.setupContext, this), 10);

        if(this.$chart.length > 0){
            this.chartContext = this.$chart[0].getContext('2d');
        
            if( this.model.answered.length > 0 ){
                setTimeout(function(){
                    self.chart = new Chart(self.chartContext).Pie(self.model.preparedAnswers, {
                        animation: false,
                        responsive: true
                    });
                }, 10);
            }
        }

        //this.delegateEvents();
        return this;
    },

    setupContext: function(){
        this.createCollection();
        var self = this;
        this.color = d3.scale.category20();
        this.width = Math.floor( $(this.el).find('.group-canvas-view').width() ) || this.width;
        this.height = Math.floor(this.width * this.ratio);
        
        var nodes = this.collection.getNodes();
        var links = this.collection.getLinks();

        this.force = d3.layout.force()
                        .charge(- (self.width ? self.width : 400))
                        .linkDistance(function(d){
                            return 100;
                        })
                        .size([this.width, this.height]);

        this.svg = d3.select('.group-canvas-view')
                    .append('svg:svg')
                    .attr('width', this.width)
                    .attr('height', this.height);

        this.force
            .nodes(nodes)
            .links(links);

        this.update();
    },

    update: function(){
        var self = this;
        var nodes = this.collection.getNodes();
        var links = this.collection.getLinks();

        this.link = this.svg.selectAll('.link')
                        .data(links)
                        .enter().append('line')
                        .attr('class', 'link')
                        .style('stroke-width', function(d){ return Math.sqrt(d.value); });

        /**
         * <g> containing ellipse and text element
         */
        this.group = this.svg.selectAll('g')
                        .data(nodes)
                        .enter()
                        .append('g')
                        .attr("transform", function(d){
                            return "translate(0,0)";
                        }).call(this.force.drag);
        /**
         * ellippse appended to <g>
         */
        this.group.append('ellipse')
                        .attr('class', 'node')
                        .attr('cx', this.calcEllipseCX(self))
                        .attr('cy', this.calcEllipseCY(self))
                        .attr('rx', this.calcEllipseRX(self))
                        .attr('ry', this.calcEllipseRY(self))
                        .style('fill', function(g){
                            return self.color(g.group);
                        });

        /**
         * text appended to <g>
         */
        this.group.append('text')
                        .text(function(d){
                            return d.name;
                        })
                        .attr('fill', '#fff')
                        .attr("transform", this.calcTextTransform(self));

        /**
         * register event handler 
         * @param  {[type]} ) {                       self.link                .attr("x1", function(d) {                    return d.source.x;                })                .attr("y1", function(d) {                    return d.source.y;                })                .attr("x2", function(d) {                    return d.target.x;                })                .attr("y2", function(d) {                    return d.target.y;                });            self.group                .attr("transform", function(d){                    return "translate("+d.x+","+d.y+")";                });        } [description]
         * @return {[type]}   [description]
         */
        this.force.on("tick", function() {
            self.link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            self.group
                .attr("transform", function(d){
                    return "translate("+d.x+","+d.y+")";
                });
        });

        this.force.start();
    },

    calcEllipseSpacing: function(context){

    },

    calcTextTransform: function(context){
        return function(){
            var width = $(this).width(),
                ry = context.calcEllipseRY(context)(),
                x = - Math.floor(width / 2),
                y = - Math.floor(ry / 2);

            return "translate("+x+", "+y+")";
        };
    },

    calcEllipseCX: function(context){
        return function(d){
            return 0;
        };
    },

    calcEllipseCY: function(context){
        return function(d){
            return 0;
        };
    },

    calcEllipseRX: function(context){
        return function(){
            var val = 10,
                base = (context.width ? context.width : 400) / 50;
            switch (true){
                case context.collection.length < 3:
                    val = 55;
                break;
                case context.collection.length < 5:
                    val = 45;
                break;
                case context.collection.length < 7:
                    val = 35;
                break;
                case context.collection.length < 8:
                    val = 25;
                break;
            }

            return base + val;
        };
    },

    calcEllipseRY: function(context){
        return function(){
            var val = 10,
                base = (context.width ? context.width : 400) / 50;
            switch (true){
                case context.collection.length < 3:
                    val = 50;
                break;
                case context.collection.length < 5:
                    val = 40;
                break;
                case context.collection.length < 7:
                    val = 30;
                break;
                case context.collection.length < 8:
                    val = 20;
                break;
            }

            return base + val;
        };
    },

    createCollection: function(){
        this.collection = new GroupCollection( this.model.groups.models );
    },

    dragStart: function(e){
        var id = $(e.target).attr('data-id');
        e.dataTransfer.setData('group-id', id);
    },


    dragOver: function(e){
        if( e.preventDefault ){
            e.preventDefault();
        }
    },

    dragEnter: function(e){
        var $dropable = $(e.target).closest('.dropable');

    },
    dragLeave: function(e){
        var $dropable = $(e.target).closest('.dropable');
    },
    dragEnd: function(){},

    dragDrop: function(e){
        var id = e.dataTransfer.getData('group-id');
        console.log(id);
    },

    /**
     * remove and answer from an SA-Question
     * @param  {MouseEvent} e
     * @return {void}
     */
    removeAnswer: function(e){
        var $el = $(e.target),
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

        $('#change-group-name').off('keyup').keyup(function(e){
            var $li = $(e.currentTarget).closest('li'),
                GroupId = $li.attr('data-id'),
                val = $(this).val(),
                group = self.model.groups.get(GroupId);

            // ENTER
            if ( e.keyCode == 13 && val.trim() ){
                group.name = val;
                self.model.save();
                self.model.trigger('change');
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

module.exports = QuestionShowAdmin;