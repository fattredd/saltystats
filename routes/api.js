var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3');

/* GET users listing. */
router.get('/', function(req, res, next) {
  let fighterArr = [];
  let db = new sqlite3.Database('./fights.sqlite', (err) => {
    if (err) throw err;

    let qry = "SELECT * FROM fighter ORDER BY win/(1.0*(win+loss)) DESC";
    db.each(qry, (err, row) => {
      newRow = row;
      newRow.total = row.win+row.loss;
      rate = (row.win/parseFloat(newRow.total)).toFixed(2);
      newRow.rate = rate;
      fighterArr.push(newRow);
    });
    db.close((err) =>{
      if (err) {console.log("not closing");throw err;}
      res.send(fighterArr);
    });
  });
});

router.get('/fight', function(req, res, next) {
  let fightArr = [];
  let db = new sqlite3.Database('./fights.sqlite', (err) => {
    if (err) throw err;
 
    let qry = "SELECT * FROM fight LIMIT 10";
    db.each(qry, (err, row) => {
      fightArr.push(row);
    });

    db.close((err) =>{
      if (err) {console.log("not closing");throw err;}
      res.send(fightArr);
    });
  });
});

module.exports = router;
