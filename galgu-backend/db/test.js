// test the db connection and make some queries

var config = require('../lib/config.js'),
    MongoClient = require('mongodb').MongoClient;

console.log('connecting to', config.get('dburi'));
MongoClient.connect(config.get('dburi'), function(err, db) {
  if(err) { return console.error(err); }
    console.log('connected!');
    var collection = db.collection('test');
    
    console.log('adding test data');
    var doc1 = {'hello':'doc1'};
    var doc2 = {'hello':'doc2'};
    var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];

    collection.insert(doc1);
    collection.insert(doc2, {w:1}, function(err, result) {});
    collection.insert(lotsOfDocs, {w:1}, function(err, result) {});
    
    
    console.log('dropping test collection');
    collection.drop(function(err) {
        if(err) { return console.error(err); }
        else { console.log('collection dropped'); }
        
            
    
        db.close(function (err) {
            if(err) { return console.error(err); }
            console.log('connection closed!');
        });
    });

});
