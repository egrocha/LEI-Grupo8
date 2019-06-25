var express = require('express');
var router = express.Router();

/* Get logout. */
router.get('/', function(req, res){
    req.session.destroy(function(err){
        res.redirect('/')
    })
})

module.exports = router;