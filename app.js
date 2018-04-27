var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var flash = require('express-flash');
var session = require('express-session');

var hbs = require('hbs');
var helpers = require('./hbshelpers/helpers');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// read the mLab connection URL
var db_url = process.env.BIRD_DB_URL;

// and connect to the database. print success or error message.
mongoose.connect(db_url)
    .then( () => {console.log('Connected to mLab'); })
    .catch( (err) => {console.log('Error connecting to mLab'); })


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper(helpers);

app.use(session({ secret: 'top secret!', resave: false, saveUninitialized: false} ));
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // consider invalid ObjectIDs as a type of 404 error
    if (err.kind === 'ObjectId' && err.name === 'CastError') {
        err.status = 404;
    }

    if (err.status === 404) {
        res.render('404'); // render custom 404 page
    }

    else {
        res.status(err.status || 500);
        res.render('error'); // render the error page
    }
});

module.exports = app;
