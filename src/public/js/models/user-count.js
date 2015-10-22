var BaseModel = require('ampersand-model');

module.exports = BaseModel.extend({
	namespace: 'usercount',
	props: {
		count: 0,
		foo: '',
		bar: ''
	},
	initialize: function(attributes, options){
		this.socket = options.socket;
		this.socket.on(
			this.namespace + ':' + 'change',
			this.setResponse.bind(this)
		);
	},

	setResponse: function( response ){
		for(var key in response){
			this.set(key, response[key]);
		}
	},

	sync: function(method, model, options){
		this.socket.emit( this.namespace + ':' + method );
	}
});