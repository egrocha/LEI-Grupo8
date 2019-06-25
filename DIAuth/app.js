var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport'); 
var uuid = require('uuid/v4');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

// Rotas do servidor
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var authRouter = require('./routes/auth')
var signupRouter = require('./routes/signup');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var authAPIRouter = require('./routes/api/auth')
var userAPIRouter = require('./routes/api/user')
var clientAPIRouter = require('./routes/api/client')
var oauthRouter = require('./routes/oauth')
var guideRouter = require('./routes/guide')

require('./auth/auth');

var app = express();

/** Ligação à base de dados. Verifica se exista
 * uma instância da base de dados num container de 
 * Docker. Se não existir, liga-se a uma instância 
 * local.
*/
mongoose.connect('mongodb://172.17.0.1:27017/LEI', { useNewUrlParser: true, useCreateIndex: true }, function(err){
	if(err){
		console.log('Docker mongo instance not found!')
		mongoose.connect('mongodb://127.0.0.1:27017/LEI', { useNewUrlParser: true, useCreateIndex: true }, function(err){
			if(err){
				console.log('Local mongo instance not found!')
			}
			else{
				console.log('Local mongo instance found!\nMongo ready: ' + mongoose.connection.readyState)
			}
		})
	}
	else{
		console.log('Docker mongo instance found!\nMongo ready: ' + mongoose.connection.readyState)
	}
})

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuração da sessão.
app.use(session({
	saveUninitialized: true,
	resave: true,
	secret: 'lei',
	store: new FileStore({logFn: function(){}}),
	key: 'authorization.sid',
	genid: () => { return uuid(); },
}));

// Inicialização do passport.
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter)
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/oauth', oauthRouter)
app.use('/guide', guideRouter)
app.use('/api/auth', authAPIRouter)
app.use('/api/user', userAPIRouter)
app.use('/api/client', clientAPIRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;