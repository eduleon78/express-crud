let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const passport = require('./config/passport');
const session = require('express-session');
const jwt = require = ('jsonwebtoken');

// importamos las rutas desde la carpeta router
let indexRouter = require('./routes/index');
let usuariosRouter = require('./routes/usuarios');
let tokenRouter = require('./routes/token');
let bicicletasRouter = require('./routes/bicicletas');
let bicicletasAPIRouter = require('./routes/api/bicicletas');
let usuariosAPIRouter = require('./routes/api/usuarios');
let authAPIRouter = require('./routes/api/auth');

const Usuario = require('./models/usuario');
const Token = require('./models/token');

const store = new session.MemoryStore;

let app = express();

app.set('secretKey', 'jwt_pwd_!!223344');

app.use(session({
    cookie: { maxAge: 240 * 60 * 1000 },
    store: store,
    saveUninitialized: true, 
    resave: 'true',
    secret: 'express_!!!***!".!".!".!".!".!"-s123123'
}));

// manejo de persistencia con mongoDB
const mongoose = require('mongoose');

let mongoDB = 'mongodb://localhost/express';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup (manejo de vistasn)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// define la carpeta de contenidao estatico
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', function(req, res){
    res.render('session/login');
});

app.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, usuario, info){
        if(err) return next(err);
        if(!usuario) return res.render('session/login', {info});
        req.logIn(usuario, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/logout', function(req, res){
    req.logOut();
    res.redirect('/');
});

app.get('/forgotPassword', function(req, res){
    res.render('session/forgotPassword');
});

app.post('/forgotPassword', function(req, res, next) {
    Usuario.findOne( { email: req.body.email }, function(err, usuario) {
        if(!usuario) return res.render('session/forgotPassword', { info: {message: 'No existe el email para un usuario existente.'}});  

        usuario.resetPassword(function(err) {
          if(err) return next(err);
          console.log('session/forgotPasswordMessage');
        });

        res.render('session/forgotPasswordMessage');
    });
});

app.get('/resetPassword/:token', function(req, res, next) {
    Token.findOne({ token: req.params.token }, function(err, token) {
        if(!token) return res.status(400).send({ type: 'not-verified', msg: 'No existe un usuario asociado al token. Verifique que su token no haya expirado.'});

        Usuario.findById(token._userId, function(err, usuario) {
            if (!usuario) return res.status(400).send({ msg: 'No existe un usuario asociado al token.' });
        res.render('session/resetPassword', { errors: {}, usuario: usuario });
        });
    });
});

app.post('/resetPassword', function(req, res) {
    if(req.body.password != req.body.confirm_password) {
        res.render('session/resetPassword', { errors: { confirm_password: { message: 'No coincide con el password ingresado'}}, 
        usuario: new Usuario({email: req.body.email})});
        return;
    }
    Usuario.findOne({ email: req.body.email }, function(err, usuario) {
        usuario.password = req.body.password;
        usuario.save(function(err) {
            if(err) {
                res.render('session/resetPassword', {errors: err.errors, usuario: new Usuario({ email: req.body.email})});
            }else{
                res.redirect('/login');
            }
        });
    });
});

// definimos las rutas
 
app.use('/usuarios', usuariosRouter);
app.use('/token', tokenRouter);

app.use('/bicicletas', loggedIn, bicicletasRouter);

app.use('/api/auth', authAPIRouter);
app.use('/api/bicicletas', validarUsuario, bicicletasAPIRouter);
app.use('/api/usuarios', usuariosAPIRouter);

app.use('/', indexRouter);

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

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        console.log('Usuario sin loguearse');
        res.redirect('/login');
    }
};

function validarUsuario(req, res, next) {
    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
      if (err) {
        res.json({status:"error", message: err.message, data:null});
      }else{
  
        req.body.userId = decoded.id;
  
        console.log('jwt verify: ' + decoded);
  
        next();
      }
    });
  }

module.exports = app;