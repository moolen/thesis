var connectedCount = function(sth){
	return Object.keys(sth.connected).length;
};

module.exports = function( socket, token ){

	// create new websocket namespace
	var namespace = socket.of('/' + token).on('connection', function(sock){
		// when any socket disconnects:
		// emit msg all remaining (sock is null!)
		sock.on('disconnect', function(){
			namespace.emit( 'usercount:update', connectedCount(namespace) );
		});
	});

	// on each connection on the namespace
	// emit message to all
	namespace.on('connection', function(){
		namespace.emit( 'usercount:update', connectedCount(namespace) );
	});

};