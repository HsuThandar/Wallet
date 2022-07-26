'use strict';
var express = require('express');
var router = express.Router();
router.use(require('../../middlewares/auth'));
console.log("inside frontend index js");
router.use('/', require('./home_controller'));



module.exports = router;