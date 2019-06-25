var express = require('express');
var router = express.Router();

/* Get de página de guia de utilização. */
router.get('/', function(req, res, next) {
    res.render('guide');
});

module.exports = router;