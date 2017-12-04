// test the db connection and make some queries

var config = require('../lib/config.js'),
    MongoClient = require('mongodb').MongoClient;

console.log('This script initializes the users collection');

var INIT_DATA = [
    { 
        // Daniel Locatelli
        'facebook_id' : '10154198565658949', 
        'name' : 'Daniel Locatelli',
        'email' : 'locatellidaniel@gmail.com', 
        'vehicle' : 'bike',
        'license' : 'ABC-123'        } 
];

var finish = function (db) {
    db.close(function (err) {
        if(err) { return console.error(err); }
        console.log('finished.');
    });
};

MongoClient.connect(config.get('dburi'), function(err, db) {
  if(err) { return console.error(err); }
    console.log('connected!');
    
    // check if users collection exists
    db.collection('users', {strict: true}, function (err, collection) {
        
        if (!err) { console.log('Collection already exists, exiting...'); return finish(db);}
        
        // create
        console.log('creating users collection');
        db.createCollection('users', function (err, collection) {
            if (err) { console.error(err); return finish(db); }
            
            console.log('inserting users...');
            collection.insert(INIT_DATA, finish.bind(this, db));
        });
    });

});
