/**
 *  Singletonized DB client
 *
 *  usage: require('./db.js')(function(db){ ... });
 */
 
var DBClient = require('mongodb').MongoClient,
    config = require('./config.js');
    
var DB = null,
    callbacks = [];

DBClient.connect(config.get('dburi'), function(err, db){
    if (err) {
        console.error('Error connecting to DB.', err);
        return process.exit(1);
    }
    
    DB = db;
    for (var i = 0, l = callbacks.length; i<l; i++) {
        callbacks[i](db);
    }
});

module.exports = function (cb) {
    if (DB) { return cb(DB); }
    
    callbacks.push(cb);
};