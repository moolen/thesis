module.exports.add = function( socket, token ){

	// create new websocket namespace
	var namespace = socket.of('/' + token);

	namespace.on('connection', function(){
		setInterval(function(){
			namespace.emit('hello', 'Hello user at channel ' + token);
		}, 1000)
		console.log('namespace connected: ' + token);
	});

};