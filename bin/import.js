const db = require('./classes/Database');
const fs = require('fs');
const prog = require('cli-progress');

(async () => {
    const progress = new prog.SingleBar({}, prog.Presets.shades_classic);

    const num = 4;
    const f = fs.readFileSync(`./bin/data/SaltyBet Records ${num}.json`);
    const data = await JSON.parse(f);
    progress.start(data.length-1, 0);

    for (var i=0; i<data.length; i++) {
        let fighters = parseEntry(data[i]);
        await db.addFighter(fighters[0]);
        await db.addFighter(fighters[1]);
        await db.addResult(fighters[0],1);
        await db.addResult(fighters[1],0);
        progress.update(i);

    }
    progress.stop();
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