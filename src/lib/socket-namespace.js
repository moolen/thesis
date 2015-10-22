var session = require('./session-adapter.js').getInstance(),
    bluebird = require('bluebird'),
    config = require('../config.js'),
    cookieParser = require('cookie-parser'),
    cookie = require('cookie');

var connectedCount = function(sth){
    return Object.keys(sth.connected).length;
};

var authenticateAdmin = function(sessionId, signedAdminCookie){
    var adminToken = cookieParser.signedCookie(
        decodeURIComponent(signedAdminCookie),
        config.cookieSecret
    );
    return session.isAdmin(sessionId, adminToken);
};

var initializeNamespace = function( socket, token ){

    // create new websocket namespace
    var namespace = socket.of('/' + token).on('connection', function(sock){
        var cookies = cookie.parse(sock.request.headers.cookie || ''),
            isAdmin = false;

        if( cookies['admin-token'] ){
            authenticateAdmin(token, cookies['admin-token']).then(function(provenAdmin){
                isAdmin = provenAdmin;
            });
        }

        // when any socket disconnects:
        // emit msg all remaining (sock is null!)
        sock.on('disconnect', function(){
            namespace.emit( 'usercount:change', { count: connectedCount(namespace) });
        });

        // ready event
        // - the client is now ready to run
        sock.on('client:ready', function(cfg){
            bluebird.all(
                session.getData(token, 'questions'),
                session.getData(token, 'activities')
            ).then(function(questions, activities){

                sock.emit('server:ready', {
                    usercount: { count: connectedCount(namespace) },
                    questions: questions,
                    activities: activities
                });
            });
        });

        sock.on('questions:add', function(model){
            if( !isAdmin ){
                return;
            }
            session.addQuestion(token, model).then(function(){
                session.getData(token, 'questions').then(function(data){
                    namespace.emit( 'questions:change', data);
                });
            });
            
        });

        sock.on('questions:change', function(payload, callback){
            if( !isAdmin ){
                return;
            }
            session.updateQuestion(token, payload.model).then(function(){
                session.getData(token, 'questions').then(function(data){
                    callback();
                    namespace.emit('questions:change', data);
                });
            });
        });

        sock.on('questions:remove', function(payload){
            if( !isAdmin ){
                return;
            }
            session.removeQuestion(token, payload.model).then(function(){
                session.getData(token, 'questions').then(function(data){
                    namespace.emit('questions:change', data);
                });
            });
        });

        sock.on('answer:submit', function( answerObject ){
            var userToken = cookieParser.signedCookie(
                    decodeURIComponent(answerObject.user),
                    config.cookieSecret
                ),
                questionId = answerObject.question,
                answer = answerObject.answer;

            session.hasAnswered(token, questionId, answerObject.user).then(function(){
                session.addAnswer(token, questionId, answerObject.user, answer).then(function(){
                    session.getData(token, 'questions').then(function(data){
                        namespace.emit( 'questions:change', data );
                    });
                });
            });
            
        });

        sock.on('group:publish', function(payload){
            if( !isAdmin ){
                return;
            }
            namespace.emit('group:publish', null);
        });
    });

    // emit message to all on each connection
    // to this namespace
    namespace.on('connection', function(){
        namespace.emit( 'usercount:change', { count: connectedCount(namespace) });
    });

};

module.exports.initializeNamespace = initializeNamespace;