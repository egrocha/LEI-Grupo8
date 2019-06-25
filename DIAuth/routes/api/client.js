var express = require('express');
var router = express.Router();
const passport = require('passport')

// Get informação do cliente
router.get('/',
    passport.authenticate('bearer', {session: false}),
    (req, res) => {
        res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope })
    }
)

module.exports = router