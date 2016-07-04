module.exports = {
  domain: '0.0.0.0',
  port: 3000,
  cookieSecret: '<my-secret-token>',
  db: {
    type: 'rethinkdb',
    host: process.env.RETHINKDB_PORT_28015_TCP_ADDR||'127.0.0.1',
    port: process.env.RETHINKDB_PORT_28015_TCP_PORT||'28015'
  }
};
