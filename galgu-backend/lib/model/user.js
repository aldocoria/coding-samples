// Sample data

var DB = require('../db.js');

// validate a passport user profile
var _createUserFromProfile = function (profile) {
    var mail = null,
        pic = null;
    if (profile.emails && profile.emails.length) {
        mail = profile.emails[0].value;
    }
    if (profile.photos && profile.photos.length) {
        pic = profile.photos[0].value;
    }
    return { 
        facebook_id : profile.id, 
        name : profile.displayName,
        email : mail,
        picture : pic
    };
};

// Finds or create a user having a valid fb login
var findOrCreate = function (accessToken, refreshToken, profile, done) {
    DB(function (db) {        
        var users = db.collection('users');
        
        users.find({'facebook_id' : profile.id}).limit(1).toArray().then(function (docs) {
            // found!
            if (docs.length) { return done(null, docs[0]); }
                
            // not found, create
            console.log('First login for', profile.id, 'creating user...');
            
            // try to insert it
            var newUser = _createUserFromProfile(profile);
            return users.insert(newUser).then(function () { 
                done(null, newUser);
            });
        }).catch(function (err) {
            done(err);
        });
    });
};

module.exports = {
    findOrCreate : findOrCreate
};
