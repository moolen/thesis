var adapterInstance,
	settings;

var Adapter = function( type, options ){
	var _adapterImplementation = require('./session-adapter-' + type + '.js');
	this.adapter = new _adapterImplementation(options);
	this.ensureImplementsInterface();
};

Adapter.prototype.interface = [
	'get',
	'getData',
	'set',
	'setData',
	'createSession',
	'removeSession',
	'addAnswer',
	'hasAnswered',
	'addQuestion',
	'updateQuestion',
	'removeQuestion',
	'isAdmin',
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

var setOptions = function(type, options){
	settings = {
		type: type,
		options: options
	};
	return this;
};

var initialize = function(){
	if(adapterInstance){
		return adapterInstance.adapter;
	}

	adapterInstance = new Adapter(settings.type, settings.options);
	return this;
};

var getInstance = function(){
	if(!adapterInstance){
		initialize();
	}
	return adapterInstance.adapter;
}

var getMiddleware = function(){

	if( !adapterInstance ){
		initialize();
	}
	return function(req, res, next){
		req.session = adapterInstance.adapter;
		next();
	};
};

module.exports.initialize = initialize;
module.exports.setOptions = setOptions;
module.exports.getMiddleware = getMiddleware;
module.exports.getInstance = getInstance;