console.log(process.env);
var express = require('express'),
    config = require('./config.js'),
    cookieParser = require('cookie-parser'),
    auth = require('./lib/authentication.js'),
    compress = require('compression'),
    storageMiddleware = require('./lib/session-adapter.js')
      .setOptions(config.db.type, {
        host: config.db.host,
        port: config.db.port
      })
      .initialize()
      .getMiddleware(),
    handlebars = require('express-handlebars'),
    less = require('express-less-middleware')(),
    i18n = require('./lib/i18n.js'),
    routes = require('./routes'),
    hbsHelper = require('./lib/hbs-helper.js'),
    app = express(),
    socketio = require('socket.io'),
    io, server;

// Enables CORS
var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

        // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    };
};

var hbs = handlebars.create({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: hbsHelper,
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.use(enableCORS);
app.use(compress());
app.use(express.static('public'));
app.use(i18n.middleware);
app.use(cookieParser(config.cookieSecret));
app.use(less);
app.use(storageMiddleware);
app.use(auth);
app.use(routes);

server = app.listen(config.port, "0.0.0.0", function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('WhiteDesk listening at http://%s:%s', host, port);
});

io = socketio(server);
//io.origins('*');

module.exports.app = app;

module.exports.getSocket = function(){
  return io;
};
