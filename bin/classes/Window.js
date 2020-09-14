const pupp = require('puppeteer');
const db = require('./Database.js');
const date = require('date-and-time');

class Window {

    constructor() {
        this.options = {
            height: 1020,
            width: 1280,
            url: "https://www.saltybet.com/",
            imgPath: "./src/",
            imgExt: ".png"
        };
        this.lastState = -1;
        this.page;
        this.browser;
        this.Red;
        this.Blue;
    }

    async init(callback) {
        this.browser = await pupp.launch({
            headless: false,
            defaultViewport: null, // Allow window to rescale
            args: [`--window-size=${this.options.width},${this.options.height}`],
            executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' // Windows
            // executablePath: '/usr/bin/google-chrome-stable' // Linux
        });
        this.page = await this.browser.newPage();
        await this.page.goto(this.options.url);
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
        const dt = date.format(now, 'YYYY.MM.DD_HH.mm.ss')
        await this.page.screenshot({path: this.options.imgPath + dt + this.options.imgExt});
    }

    async getStats(result) {
        const elem = await this.page.$('#lastbet');
        if (!elem) console.log("Error finding element");
        let text = await elem.getProperty("innerText").then(x => x.jsonValue());
        text = text.trim();
        return text;
    };
    
    async getFighters(result) {
        const elem = await this.page.$('#player1');
        if (!elem) console.log("Error finding element");
        this.Red = await elem.getProperty("value").then(x => x.jsonValue());
        this.Red = this.Red.trim();

        const elem2 = await this.page.$('#player2');
        if (!elem2) console.log("Error finding element");
        this.Blue = await elem2.getProperty("value").then(x => x.jsonValue());
        this.Blue = this.Blue.trim();

        console.log(`Fighters are ${this.Red} (red) and ${this.Blue} (blue)`);
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
        return text.slice(text.search("Team "), text.length-1);
    }

    async fetchData(result) {
        const currState = await this.getState();
        if (currState == this.lastState) {
            return;
        }
        this.lastState = currState;
        if (currState == 0) { // OPEN
            await this.getFighters();
            db.addFighter(this.Red);
            db.addFighter(this.Blue);
        } else if (currState == 1) {
            this.getScrot();
            const ratio = await this.getStats();
            db.addFight(this.Red, this.Blue, ratio);
        } else if (currState == 2) {
            const winner = await this.getWinner();
            const winBool = winner == 'Red';
            console.log(`The winner is ${winner}!`);
            db.addResult(this.Red, winBool);
            db.addResult(this.Blue, !winBool);
        }
    }
}

module.exports = Window