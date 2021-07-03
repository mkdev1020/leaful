
const configFile = process.env.NODE_ENV === 'test' ? 'config-test' : 'config';
const config = require(__dirname + `/${configFile}`);

module.exports = config;
