'use strict';
var express = require('express');
var router = express.Router();

router.use(require('../middlewares/auth'));

console.log("inside common index");


router.use('/admin', require('./admin'));
router.use('/', require('./frontend'));

module.exports = router;