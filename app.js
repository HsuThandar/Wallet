'use strict';
var express = require('express');
var session	= require('express-session');
var SessionStore = require('express-mysql-session');
var compress = require('compression');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 10001;
var passport          =     require('passport');
var server = require('http').createServer(app);
const https = require('https');
var path = require('path');
const CONFIG = require('./helpers/config');

var helmet = require('helmet');


app.use(helmet.hidePoweredBy({setTo: 'DummyServer 1.0'})); //change value of X-Powered-By header to given value
app.use(helmet.noCache({noEtag: true})); //set Cache-Control header
app.use(helmet.noSniff());    // set X-Content-Type-Options header
app.use(helmet.frameguard()); // set X-Frame-Options header
app.use(helmet.xssFilter());  // set X-XSS-Protection header
var ipaddress = "";
/*
const whitelist = ['http://localhost:'+port, 'http://'+ ipaddress +':'+port]
const corsOptions = {
  origin: function(origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed'))
    }
  }
} 
app.options('*', cors(corsOptions)); 
*/
//var csrf = require('csrf');
//var csrfProtection = csrf({ cookie: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compress());
app.set('view engine', 'ejs');
app.set('trust proxy', true);

var options = {
    host: CONFIG.db.host,
    database:CONFIG.db.database,
    user: CONFIG.db.user,
    password : CONFIG.db.password,
    port : CONFIG.db.port,
};  
/*
var sessionoptions = req.session.passport.user;
  

*/
var sessionStore = new SessionStore(options);

//save cookie in user's browser
 app.use(session({
    name:"mm pay enduser",
    key: CONFIG.passportsession.key,
    secret: CONFIG.passportsession.secret,
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
   
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/nodemodule_forclient', express.static(__dirname + '/node_modules')); // redirect bootstrap JS
app.use('/public',express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, '/views'));

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/
// error handler
app.use(function(err, req, res, next) {
  if(!err){
    next();
  }else{
    console.log("sending from error");
    // set locals, only providing error in development
    res.locals.message = err.message;
  
    // render the error page
    res.status(err.status || 500);
    res.render('error',{
      status : err.status || 500,
      message : err.message
    });
  }
  
});
app.use('/', require('./controllers'));
const fs = require('fs');
/*
https.createServer({
  key: fs.readFileSync('/var/www/enduser_domain/mmpayenduser.key'),
  cert: fs.readFileSync('/var/www/enduser_domain/mmpayenduser.cert')
}, app).listen(port, () => {
  console.log('MM Pay End User Domain is listening on port ' + port)
});
*/
https.createServer({
  key: fs.readFileSync('mmpayenduser.key'),
  cert: fs.readFileSync('mmpayenduser.cert')
}, app).listen(port, () => {
  console.log('MM Pay End User Domain is listening on port ' + port)
});
/*
app.listen(port, function() {
  console.log('MM Pay End User Domain is listening on port ' + port);
}); 
*/
