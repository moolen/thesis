var _impl,
    _settings;

module.exports = {
	initialize: function(){
		if(_impl){
			return _impl;
		}
		if( !_settings || !_settings.hasOwnProperty('type') ){
			console.log("missing database settings", _settings);
			return;
		}
		var adapterImplementation = require('./session-adapter-' + _settings.type + '.js');
		_impl = new adapterImplementation(_settings);

		return this;
	},
	setOptions: function(type, options){
		_settings = {
			type: type,
			options: options
		};
		return this;
	},
	getMiddleware: function(){
		if( !_impl ){
			initialize();
		}
		return function(req, res, next){
			req.session = _impl;
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