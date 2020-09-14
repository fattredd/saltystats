
const sqlite3 = require('sqlite3').verbose();

async function addFighter(name) {
    let db = new sqlite3.Database('./fights.sqlite', (err) => {
        if (err) throw err;
        
        let qry = `SELECT * FROM fighter WHERE name = ${name}`;
        db.get(qry, (err, row) => {
            if (row == undefined) {
                qry = `INSERT INTO fighter [name] VALUES (${name})`;
                db.run(qry, (err) => {
                    console.log(`Added new fighter ${name}`);
                });
            }
        });
    });
}

async function addFight(red, blue, ratio) {
    let db = new sqlite3.Database('./fights.sqlite', (err) => {
        if (err) throw err;

        qry = `INSERT INTO fight [red, blue, ratio] VALUES (${name},${blue},${ratio})`;
        db.run(qry, (err) => {
            console.log(`Added new fight ${red} vs ${blue} at ${ratio}`);
        });
    });
}

async function addResult(name, result) {
    let db = new sqlite3.Database('./fights.sqlite', (err) => {
        if (err) throw err;
        
        let strResult = "WIN";
        if (result == 0) {
            strResult = "LOSS";
        }
        let qry = `UPDATE fighter SET ${strResult} = ${strResult} + 1 WHERE name = ${name}`;
        db.get(qry, (err, row) => {
            console.log(`Updated ${strResult} for ${name}`);
        });
    });
}

exports.addFighter = addFighter;
exports.addFight = addFight;
exports.addResult = addResult;