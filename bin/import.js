const db = require('./classes/Database');
const fs = require('fs');

(async () => {
    const num = 0;
    const f = fs.readFileSync(`./data/SaltyBet Records ${num}.json`);
    const data = await JSON.parse(f);

    for (fight of data) {
        console.log(parseEntry(fight))
    }
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
    return [win, loss];
}
