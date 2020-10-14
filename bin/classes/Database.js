const sqlite3 = require('sqlite3');
const SqlString = require('sqlstring');

var db = new sqlite3.Database('./fights.sqlite');

async function setupDB() {

    let qry = SqlString.format(
        `CREATE TABLE IF NOT EXISTS 'stats' (
			'id' INTEGER,
            'succ' INTEGER DEFAULT 0,
            'fail' INTEGER DEFAULT 0,
            'spent' INTEGER DEFAULT 0,
            'highest' INTEGER DEFAULT 0,
            'gains' INTEGER DEFAULT 0,
            'antigains' INTEGER DEFAULT 0,
			CONSTRAINT 'id' PRIMARY KEY (id)
        )`);

    return new Promise((resolve) => db.run(qry, (err, row) => {
        if (err) { console.log("setupDB stats Error", err); }
        qry = SqlString.format(`INSERT INTO 'stats' ('id') VALUES (0) ON CONFLICT DO NOTHING`);
        db.run(qry, (err) => {
            if (err) { console.log("setupDB insert Error", err); }
            qry = SqlString.format(
                `CREATE TABLE IF NOT EXISTS 'fighter' (id INTEGER,
                    'name' TEXT NOT NULL,
                    'win' INTEGER DEFAULT 0,
                    'loss' INTEGER DEFAULT 0,
                    CONSTRAINT 'id' PRIMARY KEY (id)
                )`);
            db.run(qry, (err) => {
                if (err) { console.log("setupDB fighter Error", err); }
                qry = SqlString.format(
                    `CREATE TABLE IF NOT EXISTS 'fight' (
                        'id' INTEGER,
                        'red' TEXT,
                        'blue' TEXT,
                        'ratio' TEXT,
                        'winner' TEXT,
                        CONSTRAINT 'id' PRIMARY KEY (id)
                    )`);
                db.run(qry, (err) => {
                    if (err) { console.log("setupDB fight Error", err); }
                    resolve();
                });
            });
        });
    }));
}

async function addFighter(name) {
    if (name == "") return;

    name = name.replace('\'', '');
    let qry = SqlString.format(`SELECT * FROM fighter WHERE name = '${name}'`);

    return new Promise((resolve) => db.get(qry, (err, row) => {
        if (row == undefined) {
            qry = SqlString.format(`INSERT INTO fighter ('name') VALUES ('${name}')`);
            db.run(qry, (err) => {
                if (err) { console.log("addFighter Error", err); }
                resolve();
            });
        } else {
            let win = row.win;
            let loss = row.loss;
            resolve();
        }
    }));
}

async function addFight(red, blue, ratio, winner) {
    if (red == "") return;
    red = red.replace('\'', '');
    blue = blue.replace('\'', '');
    let qry = SqlString.format(`INSERT INTO fight ('red', 'blue', 'ratio','winner') VALUES (\"${red}\",\"${blue}\",'${ratio}','${winner}')`);

    return new Promise((resolve) => db.get(qry, (err, row) => {
        if (err) { console.log("addFighter Error", err); }
        //console.log(`Added new fight ${red} vs ${blue} at ${ratio}\r\n`);
        resolve();
    }));
}

async function addResult(name, result) {
    if (name == "") return;
    let strResult = "win";
    if (result == 0) {
        strResult = "loss";
    }
    name = name.replace('\'', '');
    let qry = SqlString.format(`UPDATE fighter SET ${strResult} = ${strResult} + 1 WHERE name = '${name}'`);

    return new Promise((resolve) => db.get(qry, (err, row) => {
        if (err) { console.log("addResult update Error", err); }
        resolve();
    }));
}

async function getFighter(name) {
    if (name == "") return [0, 0, 0];
    name = name.replace('\'', '');

    let qry = SqlString.format(`SELECT * FROM fighter WHERE name = '${name}'`);

    return new Promise((resolve) => db.get(qry, (err, row) => {
        if (row == undefined) {
            var result = [0, 0, 0];
        } else {
            let winRate = (row.win + row.loss == 0) ? 0 : (row.win / parseFloat(row.win + row.loss));
            var result = [row.win, row.loss, winRate.toFixed(3)];
        }
        resolve(result);
    }));
}

async function getFight(red, blue) {
    red = red.replace('\'', '');
    blue = blue.replace('\'', '');

    let qry = SqlString.format(
        `SELECT * FROM fight WHERE red = '${red}' AND blue = '${blue}'`
    );

    return new Promise((resolve) => db.get(qry, (err, row) => {
        if (row == undefined) {
            qry = SqlString.format(
                `SELECT * FROM fight WHERE red = '${blue}' AND blue = '${red}'`
            );
            db.get(qry, (err, row) => {
                if (row == undefined) {
                    var result = null;
                    // We haven't seen this before
                } else {
                    // Swap the winner b/c we swapped fighters
                    var result = row.winner == 'red' ? 'blue' : 'red';
                }
            });
        } else {
            // Found the fight!
            var result = row.winner;
        }
        resolve(result);
    }));
}


async function addStats(bet, result, balance, newMoney) {
    let strResult = "succ";
    let strMoney = "gains"; // This only logs money that WOULD be spent. It ignores manual bets
    let betResult = newMoney;
    if (!result) {
        strResult = "fail";
        strMoney = "antigains";
        betResult = bet;
    }
    let qry = SqlString.format(`UPDATE stats SET ${strResult} = ${strResult} + 1, spent = spent + ${bet}, highest = MAX(highest,${balance}), ${strMoney} = ${strMoney} + ${betResult}`);

    return new Promise((resolve) => db.get(qry, (err, row) => {
        if (err) { console.log("addStats update Error", err, qry); }
        resolve();
    }));
}

exports.addFighter = addFighter;
exports.getFighter = getFighter;
exports.getFight = getFight;
exports.addFight = addFight;
exports.addResult = addResult;
exports.addStats = addStats;
exports.setupDB = setupDB;