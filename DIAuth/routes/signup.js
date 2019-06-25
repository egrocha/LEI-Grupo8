var express = require('express');
var passport = require('passport');
var router = express.Router();
const User = require('../controllers/user')

/* Get signup. */
router.get('/', function(req, res) {
    res.render('signup');
});

/* Registo de um utilizador. */
router.post('/', function(req, res, next) {
    if(req.body.username.includes("@uminho.pt") || req.body.username.includes("@alunos.uminho.pt")){
        passport.authenticate('signup', function(err, user, info) {
            if(user){
                User.addInfo(user.username, req.body.name, req.body.number)
                    .then(dados => {return res.redirect(307, '/login')})
            }
            else{
                return res.redirect('/signup');
            }
        }, { session : false })(req, res, next);
    }
    else{
        res.redirect('/signup')
    }
});

module.exports = router;