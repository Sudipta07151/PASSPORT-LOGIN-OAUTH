const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const keys = require('./config/key');
const secret = require('./config/secret');
const app = express();
const jwt = require('jsonwebtoken');

passport.use(
    new SpotifyStrategy({
        clientID: keys.spotify_client_id,
        clientSecret: keys.spotify_clientSecret,
        callbackURL: '/auth/spotify/callback'
    }, (accessToken, refreshToken, expires_in, profile, done) => {
        const { email, href, display_name } = profile._json;
        const spotify_id = profile.id;
        console.log(spotify_id);
        const payload = {
            user: {
                id: spotify_id
            }
        }
        jwt.sign(
            payload, secret.jwt_secret,
            {
                expiresIn: 36000
            },
            (err, token) => {
                if (err) throw err;
                console.log(token);
                res.json({ token });
            }
        )
    })
);
passport.use(new FacebookStrategy({
    clientID: keys.facebook_client_id,
    clientSecret: keys.facebook_clientSecret,
    callbackURL: "/auth/facebook/callback"
},
    (accessToken, refreshToken, profile, cb) => {
        console.log(accessToken);
        console.log(profile)
    }
));

passport.use(new GitHubStrategy({
    clientID: keys.github_client_id,
    clientSecret: keys.github_clientSecret,
    callbackURL: "/auth/github/callback"
},
    (accessToken, refreshToken, profile, done) => {
        console.log(profile)
    }
));


app.get(
    '/auth/spotify',
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private'],
        showDialog: true
    }
    ));
app.get(
    '/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['user_friends', 'email', 'user_photos'] }));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.get('/', (req, res) => {
    res.status(200).send('RUNNING');
});



const PORT = process.env.PORT || 5000;
app.listen(PORT);

