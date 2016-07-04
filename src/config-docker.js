module.exports = {
  domain: 'wd.local',
  port: 3000,
  cookieSecret: 'frhuz45W$%ZNEBtrshv436rz$%4',
  db: {
    type: 'rethinkdb',
    host: process.env.RETHINKDB_PORT_28015_TCP_ADDR,
    port: process.env.RETHINKDB_PORT_28015_TCP_PORT
  }
};
