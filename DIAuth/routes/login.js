var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var router = express.Router();

/* Get login. */
router.get('/', function(req, res) {
    res.render('login');
})

router.post('/', 
    passport.authenticate('login'),
    function(req, res){
        user = req.session.passport.user
        var myuser = { _id : user._id, username : user.username };
        var token = jwt.sign({ user : myuser }, 'lei');
        req.session.token = token
        if(req.session.returnTo){
            var redirect = req.session.returnTo
            req.session.returnTo = undefined
            res.redirect(redirect)   
        }
        else{
            res.redirect('/')
        }
    }
)

/* Verifica se utilizador tem login feito. */
router.get('/verifyLogin', function(req, res){
    if (req.session.token) {
        jwt.verify(req.session.token, 'lei', function(err, decoded) {
            res.end('{\"Success\" : \"Logged in!\", \"status\" : 200}');
        })(req, res, next);
    } else {
        return next(error);
    }
})

/* Login de um utilizador. */
/*
router.post('/', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {     
        try {
            if (err || !user) {
                return next(err);
            }
            
            req.login(user, { session : false }, async (error) => {
                if (error) {
                    return next(error);
                }
                var myuser = { _id : user._id, username : user.username };
                // Geração do token
                var token = jwt.sign({ user : myuser }, 'lei');
                req.session.token = token
                res.redirect('/user')
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});
*/

router.post('/processLoginAlt', async(req, res, next) => {
    var user = {username: req.body.username}
    try{
        req.login(user, {session: false}, async(error) => {
            if(error){
                return next(error)
            }
            var myuser = { _id: user._id, username: user.username}
            var token = jwt.sign({user: myuser}, 'lei')
            res.jsonp(token)
        })
    } catch (error) {
        res.redirect('/login');
    }
})

module.exports = router;