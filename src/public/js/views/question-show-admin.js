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
    dialogTemplate = require('templates/dialog.hbs'),
    template = require('templates/question-show-admin.hbs');

var QuestionShowAdmin = BaseView.extend({

    template: handlebars.compile(template),
    dialogTemplate: handlebars.compile(dialogTemplate),

    ratio: 9/16,
    width: $(window).width() / 2.5,
    height: null,
    contextVisible: false,

    context: null,

    events: {
        'click .remove-answer': 'removeAnswer',
        'click .remove-member': 'removeMember',
        'click .remove-all-member': 'removeAllMembers',
        'click .publish-groups': 'publishGroups',
        'click .group-name': 'changeGroupName',
        'click .show-canvas': 'showCanvas',
        'click .hide-canvas': 'hideCanvas',
        'change .group-count': 'changeGroupCount',
        'click .randomize-groups': 'randomizeGroups',
        'click .delete-question': 'deleteQuestion',
        'dragstart [draggable]': 'dragStart',
        'dragenter .dropable': 'dragEnter',
        'dragover .dropable': 'dragOver',
        'dragleave .dropable': 'dragLeave',
        'drop .dropable': 'dragDrop'
    },

    initialize: function(){
        this.createCollection();
        this.model.on('change', this.update, this);
    },

    renderDialog: function(group, x, y){
        var self = this;
        this.$dialog = $('#dialog');

        var html = this.dialogTemplate({
            model: group
        });

        if( this.$dialog.length === 0 ){
            $('body').append(html);
        }else{
            this.$dialog.replaceWith(html);
        }

        this.$dialog = $('#dialog');

        var w = this.$dialog.width(),
            h = this.$dialog.height();

        this.$dialog.css('left', x - w/2 + 'px');
        this.$dialog.css('top', y - h + 'px');
        this.$dialog.fadeIn(200);
        this.$dialog.on('keydown', function(e){
            if(e.keyCode === 13){
                self.$dialog.hide();
                var name = self.$dialog.find('input').val();
                group.name = name;
                self.model.groups.get(group.getId()).name = name;
                $('svg [group-id="'+group.id+'"] .node-text').text(name);
                self.model.save();
                self.update();
            }

            if( e.keyCode === 27 ){
                self.$dialog.fadeOut(200);
            }
        });
        this.$dialog.find('input').focus();
    },

    render: function(){

        // preserve height
        var h = $('.question-list').height();
        $('.question-list').css('height', h);

        var self = this;
        this.renderWithTemplate();
        this.$chart = $(this.el).find('.chart-canvas');
        
        if( this.contextVisible ){
            setTimeout(_.bind(this.showCanvas, this), 10);
        }

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

        setTimeout(function(){
            $('.question-list').css('height', 'auto');
        }, 20);

        return this;
    },

    updateAnswerList: function(){
        var $list = $(this.el).find('.answers-row .answer-value'),
            model = this.model;

        $list.each(function(){
            var $el = $(this),
                answerId = $el.attr('data-id'),
                answerModel = _.findWhere(model.answers, { id: answerId });

            if( answerModel ){
                var isAnswerInGroup = model.answerIsInGroup(answerModel);

                if( isAnswerInGroup ){
                    $el.removeClass('lighten-3');
                    $el.addClass('lighten-4');
                }else{
                    $el.removeClass('lighten-4');
                    $el.addClass('lighten-3');
                }
            }
        });

    },

    setupContext: function(){
        this.createCollection();
        var self = this;
        this.color = d3.scale.category20();
        this.width = Math.floor( $(this.el).find('.group-canvas-view').width() ) || this.width;
        this.height = Math.floor(this.width * this.ratio);
        
        var nodes = this.collection.models;
        var links = this.collection.getLinks();
        var $canvas = $(this.el).find("#canvas-" + this.model.id);
        //$canvas.hide();
        var zoom = d3.behavior.zoom();
        this.force = d3.layout.force()
                        //.alpha(0.05)
                        .friction(0)
                        //.charge(10)
                        .gravity(-0.05)
                        //.theta(0.0)
                        .linkDistance(function(el){
                            var biggest = _.reduce(self.model.groups.models, function(memo, el){
                                el._rx = self.calcEllipseRX(self)(el);
                                if( memo === null ){
                                    return el;
                                }
                                else if( el._rx > memo._rx ){
                                    return el;
                                }
                                return memo;
                            }, null);
                            return Math.sqrt(
                                this.calcEllipseRX(this)(biggest) * 4
                                *
                                this.calcEllipseRY(this)(biggest) * 4
                            );
                        }
                            
                        );
                        //.size([this.width, this.height]);

        zoom.scale(0.5);
        zoom.translate([200, 200]);

        this.svg = d3.select("#canvas-" + this.model.id)
           .append("div")
           .classed("svg-container", true) //container class to make it responsive
           .append("svg")
           //responsive SVG needs these 2 attributes and no width and height attr
           .attr("preserveAspectRatio", "xMinYMin meet")
           .attr("viewBox", "0 0 600 400")
           //class to make it responsive
           .classed("svg-content-responsive", true)
           .call(zoom.on("zoom", function(){
                  self.svgWrap
                    .attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
           }));

        this.force
            .nodes(nodes)
            .links(links);

        this.svgWrap = this.svg.append('g')
            .attr('class', 'svgWrap')
            .attr("transform", "translate(200, 200)" + " scale(0.5)");

        this.update();

        this.svg.selectAll('.dropable').on('drop', function(){
            var pos = d3.mouse(this);
            var ellipse = this;
            var group = this.__data__;
            var answerId = d3.event.dataTransfer.getData('answer-id');
            var answer = self.model.getAnswer(answerId);
            self.model.groups.addMemberExclusively(group, answer);
            self.collection.addMemberExclusively(group, answer);
            $(ellipse).attr('rx', self.calcEllipseRX(self)(group) + 'px');
            $(ellipse).attr('ry', self.calcEllipseRY(self)(group) + 'px');
            self.model.save();
            self.updateAnswerList();
            self.update();
            self.force.resume();
        });

        this.svg.selectAll('.node-text').on('dblclick', function(){
            var group = this.__data__,
                pos = d3.mouse($('html')[0]),
                x = pos[0],
                y = pos[1];

            self.renderDialog(group, x, y);
        });

        // setTimeout(function(){
        //     $canvas.fadeIn();
        // }, 100);
    },

    destroyContext: function(){
        this.svg.selectAll('*').remove();
        $(this.el).find('.svg-container').remove();
    },

    update: function(){
        var self = this;

        // bail out early if no context exists
        if( !this.svg ){
            return;
        }

        function wrapText(text, width) {
          text.each(function() {
            var grp = $(this).closest('.node-group')[0].__data__;
            var headingOffset = self._calcTextTransform(grp);
            //var lineOffset = Math.floor((($(this).closest('.node-group')[0].getBBox().height + headingOffset) /2 - 20) / 16);
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                w = width(this.parentNode),
                word,
                line = [],
                lineNumber =  $(this).closest('.node-group').find('.answer-text tspan').length - 3,
                lineHeight = 20,
                y = text.attr("y") || 0,
                tspan = text
                    .text(null)
                    .append("tspan")
                    .attr("x", 0)
                    .attr("y", ++lineNumber * lineHeight);

            while (word = words.pop()) {
              line.push(word);
              tspan
                .text(line.join(" "));
              
              // case: line longer than the parent
              if (tspan.node().getComputedTextLength() > w && words.length !== 0) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text
                    .append("tspan")
                    .attr("x", 0)
                    .attr("y", ++lineNumber * lineHeight)
                    .text(word);
              }
              // case: line not longer and out of words
              else if( words.length === 0 ){
                tspan
                    .attr("y", lineNumber * lineHeight);
              }
            }
          });
        }

        /**
         * <g> containing ellipse and text element
         */
        this.group = this.svgWrap.selectAll('g.node-group')
            .data(this.collection.models, function(d){
                return d.id;
            });
        this.nodeGroup = this.group
            .enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('group-id', function(d){
                return d.id;
            })
            .attr("transform", function(d){
                return "translate(0,0)";
            });
            //.call(this.force.drag);
        this.group.exit().remove();

        this.nodeGroup
            .append('ellipse')
            .attr('class', 'node dropable')
            .attr('cx', self.calcEllipseCX(self))
            .attr('cy', self.calcEllipseCY(self))
            .attr('rx', self.calcEllipseRX(self))
            .attr('ry', self.calcEllipseRY(self))
            .style('fill', function(g){
                return self.color(g.group);
            });

        this.nodeGroup
            .append('text')
            .text(function(d){
                return d.name;
            })
            .attr('class', 'node-text')
            .attr("text-anchor", "middle")
            .attr('fill', '#fff')
            .attr("transform", self.calcTextTransform(self));

        // children node
        var answers = this.group.selectAll('g.answer')
            .data(function(model, i){
                return model.members;
            }, function(d){
                return d.id;
            });

        var answerGroup = answers
            .enter()
            .append('g')
            .attr('class', 'answer');

        answerGroup
            .append('rect')
            .attr('class', 'text-background')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', function(){

            })
            .attr('height', function(){

            })
            .attr('fill', '#EF9A9A');


        // text node
        answerGroup
            .append("text")
            .attr("class", "answer-text")
            //.attr("text-anchor", "middle")
            .attr('answer-id', function(d){
                return d.id;
            })
            .attr("dx", function(node) {
                return 0;
            })
            .attr("dy", function(node, i) {
                return 0;
            })
            .text(function(node) {
                return node.value;
            })
            // wrap text in multi-line segments
            .call(wrapText, function(el){
                var $ellipse = $(el).closest('.node-group').find('.node');
                if( $ellipse.length > 0 ){
                    return $ellipse[0].getBBox().width * 0.68;
                }
            })
            // emulate text-anchor = middle
            .call(function(el){
                el.each(function(){
                    var $text = $(this).find('tspan'),
                        w = Math.floor(this.getBBox().width / 2);

                    $text.attr('x', '-' + w);
                });
            })
            // set rect w+h attributes properly
            .call(function(el){
                el.each(function(el, i){
                    var $rect = $(this).closest('.answer').find('rect.text-background'),
                        //numLines = $(this).closest('.node-group').find('tspan').length,
                        //yOffset = (parseFloat($(this).find('tspan').first().attr('y'))),
                        x = $(this).find('tspan').first().attr('x'),
                        box = $(this).find('tspan')[0].getBBox();

                    $rect.attr('width', box.width + 10);
                    $rect.attr('height', box.height);
                    $rect.attr('x', box.x - 5);
                    $rect.attr('y', box.y);
                });
                
            })
            .call(function(el){
                el.each(function(){
                    var $text = $(this),
                        $nodeGroup = $text.closest('.node-group'),
                        $nodeText = $nodeGroup.find('.node-text');

                    // todo
                    $nodeText.attr('transform', self.calcTextTransform(self).call($nodeText, $nodeGroup[0].__data__) );
                });
            })
            .call(function(){
                var $text = $(this),
                    $nodeGroup = $text.closest('.node-group');
                var biggest = _.reduce(self.model.groups.models, function(memo, el){
                    el._rx = self.calcEllipseRX(self)(el);
                    // nothing yet
                    if( memo === null ){
                        return el;
                    }
                    //
                    else if( el._rx > memo._rx ){
                        return el;
                    }
                    return memo;
                }, null);

                // update force distance
                self.force.linkDistance(
                    Math.sqrt(
                        self.calcEllipseRX(self)(biggest) * 3
                        *
                        self.calcEllipseRY(self)(biggest) * 3
                    )
                    );
            });

        answers.exit().remove();

        

        /**
         * register event handler 
         */
        this.force.on("tick", function() {
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
        return function(group){
            return "translate(0, "+context._calcTextTransform(group)+")";
        };
    },

    _calcTextTransform: function(group){
        return - Math.floor(
            this.calcEllipseRY(this)(group) - 40
        );
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
        return function(group){
            var val = 10,
                base = (context.width ? context.width : 400) / 8,
                memberIds = _.map(group ? group.members : [], function(m){ 
                    return m.id;
                });

            var $members = $(context.el).find('.answer-value').filter(function(){
                return memberIds.indexOf($(this).attr('data-id')) !== -1;
            });

            var maxAnswerWidth = _.reduce($members, function(remainder, el){
                var elWidth = $(el).width()/2;
                if( elWidth > remainder){
                    return elWidth;
                }
                return remainder;
            }, 0);

            if( base + val < maxAnswerWidth ){
                return maxAnswerWidth;
            }

            return base + val;
        };
    },

    calcEllipseRY: function(context){
        return function(group){
            var val = 10,
                base = (context.height ? context.height : 400) / 6,
                memberIds = _.map(group ? group.members : [], function(m){ 
                    return m.id;
                });

            var $members = $(context.el).find('.answer-value').filter(function(){
                return memberIds.indexOf($(this).attr('data-id')) !== -1;
            });

            var answerHeightSum = 1.8 * _.reduce($members, function(remainder, el){
                var elHeight = $(el).height()/2;
                return remainder + elHeight;
            }, 50);

            if( base + val < answerHeightSum ){
                return answerHeightSum;
            }

            return base + val;
        };
    },

    createCollection: function(){
        this.collection = new GroupCollection( this.model.groups.models );
    },

    dragStart: function(e){
        var id = $(e.target).attr('data-id');
        e.dataTransfer.setData('answer-id', id);
    },


    dragOver: function(e){
        if( e.preventDefault ){
            e.preventDefault();
        }
        var $dropable = $(e.target).closest('.dropable');
        if( $dropable.hasClass('group') ){
            $dropable.addClass('highlight');
        }
    },

    dragEnter: function(e){
        var $dropable = $(e.target).closest('.dropable');
        if( $dropable.hasClass('group') ){
            $dropable.addClass('highlight');
        }

    },
    dragLeave: function(e){
        var $dropable = $(e.target).closest('.dropable');
        if( $dropable.hasClass('group') ){
            $dropable.removeClass('highlight');
        }
    },

    dragDrop: function(e){
        var $dropable = $(e.target).closest('.dropable'),
            groupId = $dropable.attr('data-id'),
            answerId = e.dataTransfer.getData('answer-id');

        if( $dropable.hasClass('group') ){
            $dropable.removeClass('highlight');
        }

        if( groupId ){
            var group = _.findWhere(this.model.groups.models, {id: groupId}),
                answer = _.findWhere(this.model.answers, {id: answerId});

            if( group && answer ){
                this.model.groups.addMemberExclusively(group, answer);
                this.render();
            }
        }
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
        var self = this;
        this.model.save(function(){
            self.model.publishGroups();
        });
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

    showCanvas: function(){
        $(this.el).find('.hide-canvas').show();
        $(this.el).find('.show-canvas').hide();
        $(this.el).find('.groups').hide();
        $(this.el).find('.group-canvas-view').show();
        this.contextVisible = true;
        this.setupContext();
    },

    hideCanvas: function(){
        $(this.el).find('.hide-canvas').hide();
        $(this.el).find('.show-canvas').show();
        $(this.el).find('.groups').show();
        $(this.el).find('.group-canvas-view').hide();
        this.contextVisible = false;
        this.destroyContext();
        this.render();
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

    deleteQuestion: function(){
        this.model.remove();

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
                closeField($li, group.name);
            // ESC
            }else if( e.keyCode == 27 ){
                closeField($li, group.name);
            }
        });

        $('#change-group-name').off('blur').blur(function(){
            closeField($(this).closest('li'), val);
        });

        function closeField($li, name){
            $li.find('.group-name').html( name );
        }
    }

});

module.exports = QuestionShowAdmin;