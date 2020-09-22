var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3');

/* GET home page. */
router.get('/', function(req, res, next) {
  let fightArr = [];
  let fighterArr = [];
  let currFight;

  let db = new sqlite3.Database('./fights.sqlite', (err) => {
    if (err) throw err;

    let qry = "SELECT * FROM fighter ORDER BY win+loss DESC LIMIT 20"; // win/(1.0*(win+loss))
    db.each(qry, (err, row) => {
      newRow = row;
      newRow.total = row.win+row.loss;
      rate = (parseFloat(row.win)/parseFloat(newRow.total)).toFixed(2);
      newRow.rate = rate;
      fighterArr.push(newRow);
    });
    
    qry = "SELECT * FROM fight ORDER BY id DESC LIMIT 20";
    db.each(qry, (err, row) => {
      fightArr.push(row);
    });

    qry = "SELECT * FROM current";
    db.get(qry, (err, row) => {
        currFight = row;
    });

    db.close((err) =>{
      if (err) {console.log("not closing");throw err;}

      res.render('index', {
        title: 'Salty Stats',
        fighters: fighterArr,
        fights: fightArr,
        current: currFight,
      });
    });
  });
});

module.exports = router;
