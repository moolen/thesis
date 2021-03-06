var storage = require('./storage-adapter.js').getInstance(),
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
    return storage.isAdmin(sessionId, adminToken);
};

var initializeNamespace = function( socket, token ){

    // create new websocket namespace
    var namespace = socket.of('/' + token).on('connection', function(sock){
        var isAdmin = false;

        // when any socket disconnects:
        // emit msg all remaining (sock is null!)
        sock.on('disconnect', function(){
            namespace.emit( 'usercount:change', { count: connectedCount(namespace) });
        });

        // ready event
        // - the client is now ready to run
        sock.on('client:ready', function(cfg){
            authenticateAdmin(token, cfg.admin).then(function(isActuallyAdmin){
                isAdmin = isActuallyAdmin;
                bluebird.all(
                    storage.getData(token, 'questions'),
                    storage.getData(token, 'activities')
                ).then(function(questions, activities){

                    sock.emit('server:ready', {
                        usercount: { count: connectedCount(namespace) },
                        questions: questions,
                        activities: activities
                    });
                });
            })
            
        });

        sock.on('questions:add', function(model){
            if( !isAdmin ){
                return;
            }
            storage.addQuestion(token, model).then(function(){
                storage.getData(token, 'questions').then(function(data){
                    namespace.emit( 'questions:change', data);
                });
            });
            
        });

        sock.on('questions:change', function(payload, callback){
            if( !isAdmin ){
                return;
            }
            storage.updateQuestion(token, payload.model).then(function(){
                storage.getData(token, 'questions').then(function(data){
                    namespace.emit('questions:change', data);
                    callback();
                }).catch(function(err){
                    console.log('error getData', err);
                });
            }).catch(function(err){
                console.log('error updateQuestion', err);
            });
        });

        sock.on('questions:remove', function(payload){
            if( !isAdmin ){
                return;
            }
            storage.removeQuestion(token, payload.model).then(function(){
                storage.getData(token, 'questions').then(function(data){
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

            storage.hasAnswered(token, questionId, answerObject.user).then(function(){
                storage.addAnswer(token, questionId, answerObject.user, answer).then(function(){
                    storage.getData(token, 'questions').then(function(data){
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