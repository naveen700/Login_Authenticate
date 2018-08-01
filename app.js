var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ExpressValidator = require('express-validator');
var multer =  require('multer'); 
var upload =  multer({dest : './uploads'});
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;
var bcrypt = require('bcrypt');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// // to handle file handling
// app.use(multer({ dest: './uploads' }));



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));







// handle sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true

}))

// to hanlde authenticatiom
app.use(passport.initialize());
app.use(passport.session());


// handle validators

app.use(ExpressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam = '[' + namespace.shift() + ']';

    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  } 
}));



// to handle file handling
// app.use(multer({ dest: './uploads' }));


// express-messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
}); 

 // any page requested , this will run first
app.get('*', function(req,res,next){
  res.locals.user = req.user  
  next();
});





app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
