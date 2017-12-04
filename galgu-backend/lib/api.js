/**
 *  Base GalguAPI stuff
 *
 *
 */
 
// CONSTANTS

var URL_NOT_LOGGED_IN = '/login',
    URL_LOGGED_IN = '/home',
    URL_FB_LOGIN_RETURN = '/api/v1/fblogin/return';
 
// DEPS
// external
var passport = require('passport'), 
    FacebookStrategy = require('passport-facebook'),
    BodyParser = require('body-parser'),
    ObjectID = require('mongodb').ObjectID;
var EnsureLogin = require('connect-ensure-login').ensureLoggedIn(URL_NOT_LOGGED_IN);

// galgu
var User = require('./model/user.js');
var DB = require('./db.js');

// common
var GeoJSONPoint = function (lat, lng) {
    return { "coordinates":[lng,lat],"type":"Point"};
};
var sendError = function (res, code, msg) {
    res.status(code).json({
        message : msg,
        status : 'error'
    });
};

var sendSuccess = function (res, msg) {
    res.json({
        message : msg,
        status : 'success'
    });
};

var GalguAPI = function (app) {
    // PASSPORT init
    passport.use(new FacebookStrategy({
            // TODO move these keys to env vars
            clientID: '527472804101823',
            clientSecret: '10462fe1f079e0d36825c8f3db85aa7c',
            callbackURL: URL_FB_LOGIN_RETURN,
            profileFields: ['id', 'name','picture.type(small)', 'emails', 'displayName', 'gender']
        },
        User.findOrCreate
    ));

    // TODO: proper user serialization (only save id)
    passport.serializeUser(function(user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
    });
    
    // sessions
    app.use(require('express-session')({ secret: 'galguing da werld!', resave: true, saveUninitialized: true }));
    
    //
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.use( BodyParser.json() );
    //
    // REST API routes

    // Basic login
    app.get('/api/v1/fblogin',
        passport.authenticate('facebook'),
        function (req, res) {
            var user = req.user;
            console.log('User logged in: ', user);
            
            res.end(JSON.stringify({ status : 'loggedin' }));
        }
    );
    app.get('/api/v1/fblogin/return',
        passport.authenticate('facebook', { failureRedirect: URL_NOT_LOGGED_IN }),
        function(req, res) {
            res.redirect(URL_LOGGED_IN);
        }
    );
    
    // Get user data
    app.get('/api/v1/user/me',
        function (req, res) {
            var user = req.user;
            console.log('User logged in: ', user);
            
            // TODO: adapt fields, remove passwords, etc...
            res.end(JSON.stringify(user));
        }
    );
    
    // update user position
    app.put('/api/v1/user/me', EnsureLogin, function(req, res) {
        console.log('updating pos for', req.user, req.body);
        if (!req.body.lat || !req.body.lng) {
            return sendError(res, 400, 'Missing lat or lng arguments.');
        }
        DB(function(db) {
            db.collection('users').updateOne(
                { '_id' : new ObjectID(req.user._id) },
                { $set : { 
                    lastPosition : GeoJSONPoint(req.body.lat, req.body.lng),
                    lastUpdate : Date.now()
                }},
                {upsert : true }
            ).then(function() {
                sendSuccess(res, 'Position updated.');
            }).catch(function(err) {
                sendError(res, 503, err.message);
            });
        });
    });
    
    // get users near me
    app.get('/api/v1/user/near', EnsureLogin, function(req, res) {
        console.log('finding users near', req.user);

        DB(function(db) {
            db.collection('users').find({
                '_id' : { $ne : new ObjectID(req.user._id) },
                'lastPosition' : { $near : req.user.lastPosition }
            }).limit(10).toArray(function(err, docs) {
                if (err) { return sendError(res, 503, err.message); }
                var ret = [];
                
                for (var i = 0, l = docs.length; i<l; i++) {
                    ret.push({
                        position : docs[i].lastPosition,
                        name : docs[i].name
                    });
                }
                res.json(ret).end();
            });
        });
    });
    
    
    this.ensureLogin = EnsureLogin;
};

//GalguAPI.prototype.ensureLogin = EnsureLogin;

GalguAPI.getFBLoginURL = function () {
    return '/api/v1/fblogin';
};

exports = (module.exports = function (app) { return new GalguAPI(app); } );