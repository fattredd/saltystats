const db = require('./classes/Database');
const fs = require('fs');
const prog = require('cli-progress');

(async () => {

    for(var j=0; j<5; j++) {
        const progress = new prog.SingleBar({}, prog.Presets.shades_classic);

        const f = fs.readFileSync(`./bin/data/SaltyBet Records ${j}.json`);
        const data = await JSON.parse(f);
        progress.start(data.length-1, 0);

        for (var i=0; i<data.length; i++) {
            let fighters = parseEntry(data[i]);
            await db.addFighter(fighters[0]);
            await db.addFighter(fighters[1]);
            await db.addResult(fighters[0],1);
            await db.addResult(fighters[1],0);
            let fight = parseFight(data[i]);
            await db.addFight(fight[0],fight[1],fight[2],fight[3])
            progress.update(i);

        }
        progress.stop();
        console.log("Imported All", j)
    }
})();

function parseFight(fight) {
    let red = fight['left']['name'];
    let blue = fight['right']['name'];
    let ratio = getRatio(
            fight['left']['bet_amount'],
            fight['right']['bet_amount']
        );
    let winner = (fight['winner'] == 'Left')? 'red' : 'blue';
    return [clean(red), clean(blue), clean(ratio), clean(winner)];
}

function parseEntry(fight) {
    var win = ""
    var loss = ""
    if (fight['winner'] = 'Left') {
        win = fight['left']['name'];
        loss = fight['right']['name'];
    } else {
        win = fight['left']['name'];
        loss = fight['right']['name'];
    }
    return [clean(win), clean(loss)];
}

function getRatio(a, b){
    a = parseFloat(a);
    b = parseFloat(b);
    let num = 0;
    let ratio = '';
    if (a > b) {
        num = Math.round((a/b + Number.EPSILON) * 10) / 10;
        ratio = `${num}:1`;
    } else {
        num = Math.round((b/a + Number.EPSILON) * 10) / 10;
        ratio = `1:${num}`;
    }
    return ratio;
}

function clean(name) {
    return name.replace("'","");
}