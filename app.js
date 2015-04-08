var express = require('express'),
    config = require('./config.js'),
    cookieParser = require('cookie-parser'),
    auth = require('./lib/authentication.js'),
    sessionStorage = require('./lib/session-adapter.js')
      .setOptions('memory')
      .initialize(),
    handlebars = require('express-handlebars'),
    less = require('express-less-middleware')(),
    i18n = require('./lib/i18n.js'),
    routes = require('./routes'),
    app = express(),
    socketio = require('socket.io'),
    io, server;

app.engine('.hbs', handlebars({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(express.static('public'));
app.use(i18n.middleware);
app.use(cookieParser(config.cookieSecret));
app.use(less);
app.use(sessionStorage.getMiddleware());
app.use(auth);
app.use(routes);

server = app.listen(config.port, config.domain, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
});

io = socketio(server);

module.exports.app = app;

module.exports.getSocket = function(){
  return io;
};
