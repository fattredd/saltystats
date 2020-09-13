var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

/* GET home page. */
router.get('/', function(req, res, next) {
  var fightArr = [];
  var fighterArr = [];

  let db = new sqlite3.Database('../fights.sql', (err) => {
    if (err) throw err;
    console.log('Opened database.');

    let qry = "SELECT * FROM fighter ORDER BY win/(1.0*(win+loss)) DESC";
    db.each(qry, (err, row) => {
      newRow = row;
      newRow.total = row.win+row.loss;
      rate = (row.win/parseFloat(newRow.total)).toFixed(2);
      newRow.rate = rate;
      fighterArr.push(newRow);
    });
    
    qry = "SELECT * FROM fight LIMIT 10";
    db.each(qry, (err, row) => {
      fightArr.push(row);
    });

    db.close((err) =>{
      if (err) {console.log("not closing");throw err;}
      console.log("db closed.");
      console.log(fighterArr, fightArr);

      res.render('index', {
        title: 'Salty Stats',
        fighters: fighterArr,
        fights: fightArr,
      });
    });
  });
});

module.exports = router;
