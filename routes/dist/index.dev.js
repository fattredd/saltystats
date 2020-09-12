"use strict";

var express = require('express');

var router = express.Router();

var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(':memory:');
fights = ['a', 'b', 'c'];
/* GET home page. */

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
    fights: fights
  });
});
module.exports = router;