var Application = function(){
	console.log(window.config.room);
	this.socket = io.connect( window.config.url + '/' + window.config.room);

	this.socket.onconnect(function(){
		console.log('connected to server');
	});
};

window.app = new Application();