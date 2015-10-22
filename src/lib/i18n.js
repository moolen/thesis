var lang = require('../lang'),
	locale = require('locale'),
	app = require('../app.js');
	supportedLocales = new locale.Locales( lang.available );

module.exports.middleware = function(req, res, next){
	var locales = new locale.Locales(req.headers["accept-language"]),
		bestLocale = locales.best(supportedLocales).normalized,
		viewHelper = new lang.helper( bestLocale );

	req.clientLocale = bestLocale;
	req.lang = viewHelper;
	res.locals.i18n = viewHelper;
	next();
};