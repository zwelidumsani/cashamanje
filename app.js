var createError = require('http-errors');
var express = require('express');
var path = require('path');
const multer  = require("multer");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Product = require('./models/product')
var bodyParser = require('body-parser')
var session  = require('express-session')
var MongoStore  = require('connect-mongo')(session)
var mongoClient = require('mongoose')
var flash = require('connect-flash')
var passport = require('passport')
var nodemailer = require('nodemailer')
var http = require('http')
require('./config/passport')
const accountSid = 'AC3c506767f08d7269912cf174bce0b68d';
const authToken = 'a96369219c9c9bcc60f0433ed2b17e06';
const client = require('twilio')(accountSid, authToken);
var csrf = require('csurf');

var csrfProtection = csrf();


var indexRouter = require('./routes/index'); 
//mongodb+srv://dumsani:aCCysqyflJmPlG29@cluster0.jruhp.mongodb.net/mongoDB?retryWrites=true&w=majority
//mongodb://localhost/shopping
mongoClient.connect('mongodb+srv://sicelo:qwerty123456@cluster0.9piaa.mongodb.net/mongoDB?retryWrites=true&w=majority',{  
  useUnifiedTopology: true,
   useNewUrlParser: true
}).then(() =>{
	     console.log("DB-Connection successfull!");
	})
    .catch(err => {
		console.log("DB-Connection failed!");
	})	

var app = express();
app.disable('x-powered-by');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
var handlebars = require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.json());
app.use('/view-timbita', express.static(__dirname + '/catalogue/Timbita_Catalogue.pdf'));
app.use('/view-relations', express.static(__dirname + '/catalogue/Relations_Catalogue.pdf'));   
app.use('/view-wealth', express.static(__dirname + '/catalogue/Wealth Catalogue.pdf'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/images'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(cookieParser());
app.use(session({secret: 'mySuperSecret',
 resave: false,
 saveUninitialized: false,
 Store: new MongoStore({mongooseConnection: mongoClient.connection}),
 cookie: {maxAge: 14*24*60*60*1000}
 }));
app.use(flash());
//app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection);



app.use(function(req, res, next){
	res.locals.login = req.isAuthenticated();
	res.locals.session = req.session;
	next();
});

app.use(logger('dev'));


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render("404.handlebars");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render("505.handlebars");
  res.status(500).render('500');
});

module.exports = app;
