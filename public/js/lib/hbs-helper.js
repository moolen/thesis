var hbs = require('handlebars.js'),
	_ = require('lodash');

hbs.registerHelper('is', function(val, test, opts){
	if(val !== undefined && val == test){
		return opts.fn(this);
	}
	return opts.inverse(this);
});

hbs.registerHelper('isCheckbox', function(val, opts){
	if( _.indexOf(['bool', 'mc'], val) !== -1 ){
		return opts.fn(this);
	}
	return opts.inverse(this);
});

hbs.registerHelper('isNotCheckbox', function(val, opts){
	if( _.indexOf(['bool', 'mc'], val) === -1 ){
		return opts.fn(this);
	}
	return opts.inverse(this);
});

hbs.registerHelper('isShortAnswer', function(val, opts){
	if( val == 'sa' ){
		return opts.fn(this);
	}
	return opts.inverse(this);
});


module.exports = hbs;