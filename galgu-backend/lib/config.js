/**
 * This is the config loader for GalguApp
 *
 * Loads the appropiate config depending on environment, cmdline, etc...
 */
 

var convict = require('convict'),
    schema = require('../config/schema.js');

// load schema && deafaults
var config = module.exports = convict(schema);

// Apply env overwrites
if (config.get('env') === 'development') {
    config.loadFile(['./config/development.json']);
} else if (config.get('env') === 'production') {
    config.loadFile(['./config/production.json']);
}

