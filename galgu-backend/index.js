/**
 *  Galguing the world...
 *
 */
 
var express = require('express');
var app = express();

//var GalguAPI = require('./lib/api.js')(app);
    
// App middlewares
app.set('port', (process.env.PORT || 5000));

// Frontend
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/login', function (req, res) {
    res.render('index',
        { 
            title : 'Home'
        }
    )
});

app.get('/',  function (req, res) {
    res.render(
        'index',
        { title : 'galgu' }
    )
});

// legacy android APK
app.get('/mobile', function (req, res) {
    res.redirect('/');
});

app.get('/home', function (req, res) {
    res.render(
        'home',
        { title : 'galgu', user : req.user }
    )
});


// Start app
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

