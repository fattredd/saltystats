const sqlite3 = require('sqlite3');
const SqlString = require('sqlstring');

async function addFighter(name) {
    if (name == "") return;
    let db = new sqlite3.Database('./fights.sqlite');

    name = name.replace('\'', '');
    let qry = SqlString.format(`SELECT * FROM fighter WHERE name = '${name}'`);

    return new Promise((resolve) => db.get(qry, (err, row) => {
        if (row == undefined) {
            qry = SqlString.format(`INSERT INTO fighter ('name') VALUES ('${name}')`);
            db.run(qry, (err) => {
                if (err) { console.log("addFighter Error", err); }
                //console.log(`Added new fighter ${name}`);
                resolve();
            });
        } else {
            let win = row.win;
            let loss = row.loss;
            resolve();
            //console.log(`Fighter found ${name} with stats: ${win}|${loss}`);
        }
    }));
}

async function addFight(red, blue, ratio, winner) {
    if (red == "") return;
    let db = new sqlite3.Database('./fights.sqlite');
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
    let db = new sqlite3.Database('./fights.sqlite');
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

    let db = new sqlite3.Database('./fights.sqlite');
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

    let db = new sqlite3.Database('./fights.sqlite');
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
    let db = new sqlite3.Database('./fights.sqlite');
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