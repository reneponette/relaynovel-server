/**
 * default logger
 */
var config = require('../config');
var log4js = require('log4js');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'log/' + config.env + '-access' +'.log', category: 'access' },
    { type: 'file', filename: 'log/' + config.env + '-trace' + '.log', category: 'trace' }
  ]
});

module.exports.access = log4js.getLogger('access');
module.exports.trace = log4js.getLogger('trace');