
const sqlite3 = require('sqlite3');
const SqlString = require('sqlstring');


async function addFighter(name) {
    if (name == "") return;
    let db = new sqlite3.Database('./fights.sqlite', (err) => {
        if (err) {console.log("addFighter Error", err);}
        
        name = name.replace('\'','');
        let qry = SqlString.format(`SELECT * FROM fighter WHERE name = '${name}'`);
        db.get(qry, (err, row) => {
            if (row == undefined) {
                qry = SqlString.format(`INSERT INTO fighter ('name') VALUES ('${name}')`);
                db.run(qry, (err) => {
                    if (err) {console.log("addFighter Error", err);}
                    //console.log(`Added new fighter ${name}`);
                });
            } else {
                let win = row.win;
                let loss = row.loss;
                //console.log(`Fighter found ${name} with stats: ${win}|${loss}`);
            }
        });
    });
}

async function addFight(red, blue, ratio, winner) {
    if (red == "") return;
    let db = new sqlite3.Database('./fights.sqlite', (err) => {
        if (err) {console.log("addFight Error", err);}
        red = red.replace('\'','');
        blue = blue.replace('\'','');
        let qry = SqlString.format(`INSERT INTO fight ('red', 'blue', 'ratio','winner') VALUES (\"${red}\",\"${blue}\",'${ratio}','${winner}')`);
        db.get(qry, (err, row) => {
            if (err) {console.log("addFighter Error", err);}
            console.log(`Added new fight ${red} vs ${blue} at ${ratio}\r\n`);
        });
    });
}

async function addResult(name, result) {
    if (name == "") return;
    let db = new sqlite3.Database('./fights.sqlite', (err) => {
        if (err) {console.log("addResult Error", err);}
        
        let strResult = "win";
        if (result == 0) {
            strResult = "loss";
        }
        name = name.replace('\'','');
        let qry = SqlString.format(`UPDATE fighter SET ${strResult} = ${strResult} + 1 WHERE name = '${name}'`);
        db.get(qry, (err, row) => {
            if (err) {console.log("addResult update Error", err);}
        });
    });
}

async function getFighter(name) {
    if (name == "") return [0,0];
    name = name.replace('\'','');

    let db = new sqlite3.Database('./fights.sqlite');
    let qry = SqlString.format(`SELECT * FROM fighter WHERE name = '${name}'`);

    return new Promise((resolve) => db.get(qry, (err, row) => {
            if (row == undefined) {
                var result = [0,0];
            } else {
                var result = [row.win,row.loss];
            }
            resolve(result);
        }));
}

exports.addFighter = addFighter;
exports.getFighter = getFighter;
exports.addFight = addFight;
exports.addResult = addResult;