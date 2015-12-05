var express  = require('express'),
    http     = require('http'),
    app      = module.exports.app = express(),
    server   = http.createServer(app)
    io       = require('socket.io').listen(server),

    mongoose       = require('mongoose'),
    morgan         = require('morgan'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    flash          = require('connect-flash'),
        
    session       = require('express-session'),
    sessionConfig = require('./config/session.js'),
    passport      = require('passport');

// configuration =================

mongoose.connect('mongodb://localhost:27017');     // connect to mongoDB database on bound localhost

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

require('./config/passport')(passport);

app.use(session({secret : sessionConfig.secret }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/routes')(app, passport, io);

app.set('view-engine', 'ejs');

//app.get('/', function(req, res) {
//    res.sendFile('./public/index.html');
//});

io.on('connection', function (socket) {
    console.log('Socket succesfully connected with id: '+socket.id);
});

// listen (start app with node server.js) ======================================
server.listen(80);