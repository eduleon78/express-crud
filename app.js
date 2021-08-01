var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// importamos las rutas desde la carpeta router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bicicletaRouter = require('./routes/bicicletas');

const exp = require('constants');

var app = express();

// view engine setup (manejo de vistasn)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// define la carpeta de contenidao estatico
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// definimos las rutas 
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/bicicletas', bicicletaRouter);

//catch 404 and forward to error handler (paginas que no existen)
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler (errore en el servidor, errores en algun metodo)
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;