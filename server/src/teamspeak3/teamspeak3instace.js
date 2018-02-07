const Teamspeak3Connector = require('./teamspeak-connector');
require('./teamspeak-utils');
const config = require('../../config.json').teamspeak.connection;

module.exports = new Teamspeak3Connector(config.port, config.host, config.login, config.password, config.serverId);