const pupp = require('puppeteer');

(async() => {
    const browser = await pupp.launch();

    const page = await browser.newPage();
    await page.goto(__dirname + '/index.html');

    await page.content();
    const elem = await page.$('#lastbet');
    if (!elem) console.log("Error finding element");
    const spans = await elem.$$('span');
    var spanContent = [];
    for (s of spans) {
        let text = await s.getProperty("innerText").then(x => x.jsonValue());
        text = text.trim();
        const extractRegexp = /\+?\$?([\d\.]+)/g
        const reg = extractRegexp.exec(text);
        spanContent.push(reg[1])
    }
    console.log(spanContent);
    let ratio = `${spanContent[2]}:${spanContent[3]}`;
    await browser.close();
})();