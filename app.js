const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

// flash: to store messages in session
const flash = require('connect-flash');

// morgan: to log every request
const morgan = require('morgan');

// setup express app
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev')); // log every request to the console

// session is used by passport
app.use(session({
     secret: 'my-super-secrete-code!@#$_-++',
     resave: false,
     saveUninitialized: false,
     maxAge: 60*60*1000  // expire in 1 hour if inactive
    })
);
app.use(flash()); // to use flash messages stored in session
app.use(passport.initialize());
app.use(passport.session()); // for persistent login sessions

// protection against cross site request forgery
const csrf = require('csurf');
// csrf() must be set after cookieParser and session
app.use(csrf());

// star db and use passport
require('./model/database');
require('./config/passport');

// routing setup

app.get('/', (req, res) => {
    res.render('index', {req});
})

app.get('/signup', (req, res) => {
    const messages = req.flash('signuperror');
    res.render('signup', {req, csrfToken: req.csrfToken(), messages});
});

app.post('/signup', passport.authenticate('localsignup', {
    successRedirect: '/login',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.get('/login', (req, res) => {
    const messagesuccess = req.flash('signupsuccess');
    const messageerror = req.flash('loginerror');
    res.render('login', {req, csrfToken: req.csrfToken(), messagesuccess, messageerror});
})

// register the user at session on successful login
// then, use auth middleware for user protected page access
app.post('/login', passport.authenticate('locallogin', {
    successRedirect: '/userhome',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// isLoggedIn middleware verifies if already logged in
app.get('/userhome', isLoggedIn, (req, res) => {
    // get user stored in session object and pass it
    res.render('userhome', {user: req.user});
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.render('errorpage', {message: 'Login required to access this page.'});
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});