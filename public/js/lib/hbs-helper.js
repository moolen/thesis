var hbs = require('handlebars.js');

hbs.registerHelper('is', function(val, test, opts){
	if(val !== undefined && val == test){
		return opts.fn(this);
	}
	return opts.inverse(this);
});

module.exports = hbs;