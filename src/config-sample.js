module.exports = {
  domain: '127.0.0.1',
  port: 80,
  cookieSecret: '<my-secret-token>',
  db: {
    type: 'rethinkdb',
    host: 'rethinkdb',
    port: process.env.RETHINKDB_PORT_28015_TCP_PORT||'28015'
  }
};
