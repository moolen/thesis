var _ = require('lodash'),
    Promise = require('bluebird'),
    r = require('rethinkdb');


var SessionRethinkAdapter = function( options ){
    
    options = options || {};
    var self = this;

    this.db = options.db || 'whitedesk';
    this.conn = null;

    r.connect({
        host: options.host,
        port: options.port,
        db: this.db
    }, function(err, conn){
        if(err) throw err;
        self.conn = conn;

    // initialize database
    // and `sessions` table
    // and socket namespaces
    r.dbList().contains('whitedesk')
        .do(function(databaseExists){
            return r.branch(databaseExists, { created: 0 }, r.dbCreate('whitedesk').do(function(){
                return r.db(self.db).tableList().contains('sessions').do(function(tableExists){
                    return r.branch(tableExists, { created: 0 }, r.tableCreate('sessions'));
                });
            }));
        }).run(conn, function(){
            var socketNamespace = require('./socket-namespace.js'),
                socket = require('../app.js').getSocket();

            r.table('sessions').run(self.conn, function(err, c){
                if(err) throw err;
                c.each(function(err, session){
                       socketNamespace.initializeNamespace(socket, session.id);
                });
            });
        });
    });

};

/**
 * sets a session
 * @param {string} sessionId [sessions id]
 * @param {string} key       [desired key]
 * @param {mixed} val       [desired value]
 */
SessionRethinkAdapter.prototype.set = function( sessionId, key, val ){
    var session = this.get(sessionId);
    if(!session){
        throw "session does not exist";
    }

    session[key] = val;
    return this;
};

/**
 * returns a session object 
 * @param  {string} sessionId [sessions id]
 * @return {Object}           [the session]
 */
SessionRethinkAdapter.prototype.get = function(sessionId){
    var ssid = sessionId;
    return r.table('sessions').filter({
        id: sessionId
    }).run(this.conn).then(function(c){
        return c.next();
    }).catch(function(e){
        console.log("could not find session: " + ssid);
    });
};

/**
 * sets data on the session
 * @param {string} sessionId [sessions id]
 * @param {string} key       [desired key]
 * @param {mixed} data      [the data value]
 * @return {this}
 */
SessionRethinkAdapter.prototype.setData = function( sessionId, key, data ){
    
    var update = { data: {} };
    update.data[key] = data;

    return r.table('sessions').filter({ id: sessionId }).update(update).run(this.conn);
};

/**
 * session data getter
 * @param  {string} sessionId [sessions id]
 * @param  {string} key       [key of dataattribute]
 * @return {mixed}           [the value for that key]
 */
SessionRethinkAdapter.prototype.getData = function(sessionId, key){
    
    return r.table('sessions').filter({ id: sessionId }).run(this.conn).then(function(cursor){
        return cursor.next().then(function(res){
            return res.data[key];
        });
    });
};

/**
 * creates a session with id and adminToken
 * @param  {string} sessionId  [sessions id]
 * @param  {string} adminToken [admin token]
 * @return {[type]}            [description]
 */
SessionRethinkAdapter.prototype.createSession = function(sessionId, adminToken){
    
    return r.table('sessions').insert(
        {
            id: sessionId,
            adminToken: adminToken,
            users: 1,
            data: {
                questions: []
            }
        }
    ).run(this.conn);
};

/**
 * removes a session with a given id
 * @param  {string} id [session id]
 * @return {Object}    [the removed session]
 */
SessionRethinkAdapter.prototype.removeSession = function(id){
    return r.table('sessions').filter({ id: id }).remove().run(this.conn);
};

/**
 * validates an adminToken against a session
 * @param  {string}  sessionId  [sessions id]
 * @param  {string}  adminToken [admin token]
 * @return {Promise}
 */
SessionRethinkAdapter.prototype.isAdmin = function(sessionId, adminToken){
    return r.table('sessions').filter({ id: sessionId||null, adminToken: adminToken||null }).count().run(this.conn).then(function(count){
        return count >= 1;
    });
};

/**
 * checks a usertoken if the user has already answered a question in a session
 * @param  {string}  sessionId  [sessions id]
 * @param  {string}  questionId [questions id]
 * @param  {string}  userToken  [user token]
 * @return {Boolean}            [has answered or not]
 */
SessionRethinkAdapter.prototype.hasAnswered = function(sessionId, questionId, userToken ){
    return this.getData(sessionId, 'questions').then(function(questions){

        var question = _.find(questions, function(question){
            return question.id === questionId;
        });

        if(question){
            var hasAnswered = _.find(question.answered, function(answeredUser){
                return answeredUser == userToken;
            });

            return hasAnswered ? true : false;

        }else{
            throw "Question does not exist";
        }

    });
    
};

/**
 * adds an answer to a question 
 * @param {string} sessionId  [sessions id]
 * @param {string} questionId [questions id]
 * @param {string} userId     [users id]
 * @param {boolean} answer     [if successful or not]
 */
SessionRethinkAdapter.prototype.addAnswer = function(sessionId, questionId, userId, answer){
    var self = this;
    return this.getData(sessionId, 'questions').then(function(questions){
        var question = _.find(questions, function(question){
            return question.id === questionId;
        });

        if( question ){

            question.answered = question.answered || [];
            question.answered.push( userId );

            question.answers = question.answers || [];
            question.answers.push(answer);

            return self.setData(sessionId, 'questions', questions);

        }else{
            throw 'addAnswer: Question does not exist.';
            
        }
    });
};

/**
 * adds a question to a session
 * @param {string} sessionId    [sessions id]
 * @param {void}
 */
SessionRethinkAdapter.prototype.addQuestion = function(sessionId, question){
    var self = this;

    return this.getData(sessionId, 'questions').then(function(data){
        data.push(question);
        return self.setData(sessionId, 'questions', data);
    });
};

/**
 * updates a question
 * @param  {string} sessionId    [session id]
 * @param  {Object} question [question object]
 * @return {void}
 */
SessionRethinkAdapter.prototype.updateQuestion = function(sessionId, question){
    var self = this;
    return this.getData(sessionId, 'questions').then(function(data){

        match = _.find(data, function(model){
            return model.id == question.id;
        });

        if(match){
            // writable properties: answers, groups
            match.answers = question.answers;
            match.groups = question.groups;
        }

        return self.setData(sessionId, 'questions', data);
    });
};

/**
 * removes a question from a session
 * @param  {string} sessionId    [sessions id]
 * @param  {Object} question [question Object]
 * @return {Object|undefined}          [returns removed question or undefined]
 */
SessionRethinkAdapter.prototype.removeQuestion = function(sessionId, question){
    var self = this;
    return this.getData(sessionId, 'questions').then(function(data){
        var removedData = _.remove(data, function(model){
            return model.id === question.id;
        });
        console.log(removedData, data);
        return self.setData(sessionId, 'questions', data);
    });
    
};

module.exports = SessionRethinkAdapter;
