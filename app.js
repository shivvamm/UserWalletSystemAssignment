var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var MongoClient = require('mongodb').MongoClient;
var url = "";
var winston = require('winston');
var { format } = require('logform');
const { combine, timestamp, label, printf } = format;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');


mongoose.connect('', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const loggerTransports = [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

if (process.env.NODE_ENV !== 'production') {
  loggerTransports.push(new winston.transports.Console());
}

const loggerw = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'API' }),
    timestamp(),
    myFormat
  ),
  transports: loggerTransports
});

var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var userRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();

// Log all API requests to file and console
app.use((req, res, next) => {
  loggerw.info(`${req.method} ${req.url}`);
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRouter);
app.use('/register', registerRouter);
app.use('/admin', adminRouter);
app.use('/index',userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // log the error
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
