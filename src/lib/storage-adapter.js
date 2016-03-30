var _impl,
    _settings;

module.exports = {
	initialize: function(){
		if(_impl){
			return _impl;
		}
		if( !_settings || !_settings.hasOwnProperty('type') ){
			console.log("missing storage settings", _settings);
			return;
		}
		var adapterImplementation = require('./storage-' + _settings.type + '.js');
		_impl = new adapterImplementation(_settings);

		return this;
	},
	setOptions: function(type, options){
		_settings = {
			type: type,
			port: options.port,
			host: options.host
		};
		return this;
	},
	getMiddleware: function(){
		if( !_impl ){
			initialize();
		}
		return function(req, res, next){
			req.storage = _impl;
			next();
		};
	},
	getInstance: function(){
		if(!_impl){
			initialize();
		}
		return _impl;
	}
};