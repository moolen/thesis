var express = require('express'),
    cookieParser = require('cookie-parser'),
    auth = require('./lib/authentication.js'),
    sessionStorage = require('./lib/session-adapter.js')('memory'),
    handlebars = require('express-handlebars'),
    less = require('express-less-middleware')(),
    i18n = require('./lib/i18n.js'),
    routes = require('./routes'),
    app = express(),
    socketio = require('socket.io'),
    io, server;


app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('view options', { foo: 'bar' });

app.use(express.static('public'));
app.use(i18n.middleware);
app.use(cookieParser('<my-secret-token>'));
app.use(less);
app.use(sessionStorage);
app.use(auth);
app.use(routes);

server = app.listen(3000, '0.0.0.0', function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
});

io = socketio(server);

module.exports.app = app;

module.exports.getSocket = function(){
  return io;
};