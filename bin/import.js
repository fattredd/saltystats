const db = require('./classes/Database');
const fs = require('fs');
const prog = require('cli-progress');

(async () => {
    const bar1 = new prog.SingleBar({}, prog.Presets.shades_classic);

    const num = 0;
    const f = fs.readFileSync(`./bin/data/SaltyBet Records ${num}.json`);
    const data = await JSON.parse(f);
    bar1.start(data.length, 0);

    for (var i=0; i<data.length; i++) {
        let fighters = parseEntry(data[i]);
        await db.addFighter(fighters[0]);
        await db.addFighter(fighters[1]);
        await db.addResult(fighters[0],1);
        await db.addResult(fighters[1],0);
        bar1.update(i);

    }
    bar1.stop();
    console.log("Imported All", num)
})();

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

function clean(name) {
    return name.replace("'","");
}