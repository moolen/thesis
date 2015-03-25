var home = function homeRoute(req, res){
	res.render('home', {
		lang: req.lang
	});
};

module.exports = function(router){
	router.get('/', home);
};