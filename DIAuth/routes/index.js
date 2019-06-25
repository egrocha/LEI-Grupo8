var express = require('express');
var router = express.Router();

/* Get de página principal. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
