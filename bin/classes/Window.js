const pupp = require('puppeteer');
const db = require('./Database.js');
const date = require('date-and-time');
const jimp = require("jimp");
const CREDS = require("../../creds");

class Window {

    constructor() {
        this.options = {
            height: 1020,
            width: 1280,
            loginUrl: "https://www.saltybet.com/authenticate?signin=1",
            url: "https://www.saltybet.com/",
            imgPath: "./public/img/scrot/",
            imgExt: ".png",
            headless: true,
            bettingFloor: 500, // All in under this val
            bet: true
        };
        this.lastState = -1;
        this.ratio = "";
        this.page;
        this.browser;
        this.Red;
        this.Blue;
        this.balance;
        this.bet;
        this.selected;
    }

    async init(callback) {
        db.setupDB();
        this.browser = await pupp.launch({
            headless: this.options.headless,
            defaultViewport: null, // Allow window to rescale
            args: [`--window-size=${this.options.width},${this.options.height}`],
            executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' // Windows
                // executablePath: '/usr/bin/google-chrome-stable' // Linux
        });
        this.page = await this.browser.newPage();

        // Login
        await this.page.goto(this.options.loginUrl, { waitUntil: 'networkidle0' });
        await this.page.type('#email', CREDS['email']);
        await this.page.type('#pword', CREDS['pass']);
        // click and wait for navigation
        await Promise.all([
            this.page.click('.submit'),
            this.page.waitForNavigation(),
        ]);
        console.log("Logged in");

        // await this.page.goto(this.options.url);
        await this.page.evaluate(() => {
            localStorage.setItem('mature', 'true')
            localStorage.setItem('video-muted', '{"default":false}')
            localStorage.setItem('volume', '0.5')
            localStorage.setItem('video-quality', '{"default":"160p30"}')
        })
        await this.page.reload({
            waitUntil: ["networkidle2", "domcontentloaded"]
        })
        console.log("Page loaded");
    }

    close() {
        this.browser.close();
    }

    async getScrot(result) {
        // TODO: ensure twitch is loaded
        const now = new Date();
        const dt = date.format(now, 'YYYY.MM.DD_HH.mm.ss');
        const path = this.options.imgPath + dt + `_${this.Red} vs ${this.Blue}` + this.options.imgExt;
        await this.page.screenshot({ path: path });
        jimp.read(path, (err, file) => {
            if (err) {
                console.log("Failed to load img.");
                rerturn;
            }
            file
                .crop(300, 160, 680, 510)
                .scale(0.6)
                .quality(60)
                .write(path);
        });
    }

    async getStats(result) {
        const elem = await this.page.$('#lastbet');
        if (!elem) console.log("Error finding element");
        const spans = await elem.$$('span');
        var spanContent = [];
        for (var s of spans) {
            let text = await s.getProperty("innerText").then(x => x.jsonValue());
            text = text.trim();
            const extractRegexp = /\+?\$?([\d\.]+)/g
            const reg = extractRegexp.exec(text);
            spanContent.push(reg[1])
        }
        let ratio = `${spanContent[2]}:${spanContent[3]}`;
        return [spanContent[0], spanContent[1], ratio];
    };

    async getFighters(method = false) {
        // Primary method during bets
        let redSel = '#player1';
        let blueSel = '#player2';
        let prop = "value";
        if (method) { // If we're already fighting, use this
            redSel = '#odds .redtext';
            blueSel = '#odds .bluetext';
            prop = "innerText";
        }
        const elem = await this.page.$(redSel);
        if (!elem) console.log("Error finding element", method);
        this.Red = await elem.getProperty(prop).then(x => x.jsonValue());
        this.Red = this.Red.trim();

        const elem2 = await this.page.$(blueSel);
        if (!elem2) console.log("Error finding element");
        this.Blue = await elem2.getProperty(prop).then(x => x.jsonValue());
        this.Blue = this.Blue.trim();

        console.log(`\r\nFighters are ${this.Red} (red) and ${this.Blue} (blue)`);
    };

    async getState(result) {
        const elem = await this.page.$('#betstatus');
        if (!elem) {
            console.log("Error finding element");
            return -1;
        }
        let text = await elem.getProperty("innerText").then(x => x.jsonValue());
        text = text.trim();
        //console.log(text);
        /* Possible states
            Bets are OPEN!
            Bets are locked until the next match.
            *** wins! Payouts to Team Blue/Red. 
        //*/
        if (text.search("OPEN") > 0) {
            return 0;
        } else if (text.search("locked") > 0) {
            return 1;
        } else if (text.search("wins") > 0) {
            return 2;
        } else {
            return -1;
        }
    }

    async getWinner(result) {
        const elem = await this.page.$('#betstatus');
        if (!elem) {
            console.log("Error finding element");
            return ""; // Assume Blue won I guess
        }
        let text = await elem.getProperty("innerText").then(x => x.jsonValue());
        text = text.trim();
        return text.slice(text.lastIndexOf("Team "), text.length - 1);
    }

    async getBalance() {
        const numDat = await this.page.$('#balance');
        const num = await numDat.getProperty("innerText").then(x => x.jsonValue());
        return parseInt(num.replace(',', ''));
    }

    async placeBet(fighter, amount) {
        // Note that the last placed bet is used, so someone watching
        //  a fight will always be able to bet normally
        if (fighter == 'red') {
            var selector = '#player1';
        } else {
            var selector = '#player2';
        }
        await this.page.type('#wager', amount.toString());
        if (this.options.bet) {
            await this.page.click(selector);
        } else {
            console.log("Betting disabled in options");
        }
        console.log(`Bet of \$${amount} placed for ${fighter}`)
    }

    async chooseBet(p1, p2) {
        const balance = await this.getBalance();
        const fight = await db.getFight(p1, p2);
        const redStats = await db.getFighter(p1);
        const blueStats = await db.getFighter(p2);
        console.log("bet:", balance, redStats, blueStats);
        let color = 'red';
        let num = 1;
        // 0 - Win
        // 1 - Loss
        // 2 - Ratio
        if (fight != null) { // Has the fight happened before?
            console.log(`Fight found! Last winner was ${fight}`)
            color = fight;
            num = balance;
        } else if (redStats[2] > blueStats[2]) { // Better ratio // confidence interval?
            color = 'red';
            num = balance * 0.2;
            if (redStats[2] - blueStats[2] > 0.06)
                num = balance * 0.4;
        } else if (redStats[2] < blueStats[2]) {
            color = 'blue';
            num = balance * 0.2;
            if (blueStats[2] - redStats[2] > 0.06)
                num = balance * 0.4;
        } else if (redStats[0] > blueStats[0]) { // More wins
            color = 'red';
            num = balance * 0.2;
        } else if (redStats[0] < blueStats[0]) {
            color = 'blue';
            num = balance * 0.2;
        } else if (redStats[0] > redStats[1]) { // Win > loss
            color = 'red';
            num = balance * 0.1;
        } else if (blueStats[0] > blueStats[1]) {
            color = 'blue';
            num = balance * 0.1;
        } else if (redStats[1] > blueStats[1]) { // Less loss  
            color = 'blue';
            num = balance * 0.1;
        } else if (redStats[1] < blueStats[1]) {
            color = 'red';
            num = balance * 0.1;
        } else if (redStats == blueStats) { // Same, just get exp
            color = 'red';
            num = 1;
        }

        if (balance < this.options.bettingFloor)
            num = balance;
        num = Math.floor(num);
        this.balance = balance;
        this.bet = num;
        this.selected = color;
        return [color, num];
    }

    async fetchData(result) {
        const currState = await this.getState();
        this.page.screenshot({ path: "./public/img/scrot" + this.options.imgExt });
        if (currState == this.lastState) {
            return;
        }
        if (currState == 0 || this.lastState == -1) { // OPEN or fresh launch
            const altMode = this.lastState == -1 && currState != 0;
            this.lastState = currState;
            await this.getFighters(altMode);
            db.addFighter(this.Red);
            db.addFighter(this.Blue);

            if (this.Red != '' && !altMode) {
                const bet = await this.chooseBet(this.Red, this.Blue);
                this.placeBet(bet[0], bet[1]);
            }
            this.lastState = currState;
        }
        this.lastState = currState;
        if (currState == 1) { // LOCKED
            this.getScrot();
            if (this.selected != undefined) {
                const stats = await this.getStats();
                this.bet = stats[0];
                this.newMoney = stats[1];
                this.ratio = stats[2];
            }
        } else if (currState == 2 && this.lastState != -1) { // WIN
            let winner = await this.getWinner();
            winner = winner.toLowerCase()
            const winBool = winner.includes('red');
            console.log(`The winner is ${winner}!`);
            db.addResult(this.Red, winBool);
            db.addResult(this.Blue, !winBool);
            if (this.selected != undefined)
                db.addStats(this.bet, winner.includes(this.selected), this.balance, this.newMoney);
            db.addFight(this.Red, this.Blue, this.ratio, winner);
        }
    }
}

module.exports = Window