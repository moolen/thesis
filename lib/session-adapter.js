var adapterInstance;

var Adapter = function( type, options ){
	this.adapter = new (require('./session-adapter-' + type + '.js'))(options);
	this.ensureImplementsInterface();
};

Adapter.prototype.interface = [
	'get',
	'set',
	'exists',
	'createSession'
];

Adapter.prototype.ensureImplementsInterface = function(){

	var notImplementedProperties = [];

	for( var i = 0; i < this.interface.length; i++ ){
		var prop = this.interface[i];
		if( undefined === this.adapter[prop] ){
			notImplementedProperties.push(prop);
		}
	}

	if(notImplementedProperties.length > 0){
		throw new Error("Adapter does not implement: " + notImplementedProperties.join(', '));
	}
};

module.exports = function(type, options){
	var sessionAdapter = new Adapter(type, options);
	return function(req, res, next){
		req.session = sessionAdapter.adapter;
		next();
	};
};