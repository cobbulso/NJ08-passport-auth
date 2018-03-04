// passport is also imported at app.js
// the configuration made at app.js is available here too
// do not configure it again
const passport = require('passport');
const User = require('../model/user');
const LocalStrategy = require('passport-local').Strategy;

// how to serialize user to store in session
passport.serializeUser((user, callback) => {
    callback(null, user._id);
});

// how to deserailize user from serialized data (user)
passport.deserializeUser((id, callback) => {
    User.findById(id, (err, user) => {
        callback(err, user);
    })
});

passport.use('localsignup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, callback) => {
    User.findOne({'email': email}, (err, user) => {
        if (err) {
            return callback(err);
        }
        if (user) {
            return callback(null, false, req.flash('signuperror','Email is already in use'));
        }
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, result) => {
            if (err) {
                return callback(err)
            }
            console.log('save', newUser);
            return callback(null, newUser, req.flash('signupsuccess', 'Sign up successful! Login, please!'));
        });
    });
}));

passport.use('locallogin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, callback) => {
    User.findOne({'email': email}, (err, user) => {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(null, false, req.flash('loginerror', 'username not found'));
        }
        if (!user.verifyPassword(password, user.password)) {
            return callback(null, false, req.flash('loginerror', 'incorrect password'));
        }
        return callback(null, user);
    });
}));