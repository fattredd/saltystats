const pupp = require('puppeteer');

class Window {
    constructor() {
        this.options = {
            height: 1020,
            width: 1280,
            url: "https://www.saltybet.com/",
            img: "scrot.png"
        };
    }

    async init(callback) {
        this.browser = await pupp.launch({
            headless: false,
            defaultViewport: null, // Allow window to rescale
            args: [`--window-size=${this.options.width},${this.options.height}`]
        });
        this.page = await this.browser.newPage();
        await this.page.goto(this.options.url);
        callback.bind(this)();
    }
    
    close() {
        this.browser.close();
    }

    async getScrot() {
        await this.page.screenshot({path: this.options.img});
    }

    async getFighters() {
        const elem = await this.page.$('#odds');
        if (!elem) console.log("Error finding element");
        const text = await elem.getProperty("innerText").then(x => x.jsonValue());
        console.log(text.trim());
    };

    async getState() {
        const elem = await page.$('#betstatus');
        if (!elem) console.log("Error finding element");
        const text = await elem.getProperty("innerText").then(x => x.jsonValue());
        console.log(text.trim());
    }
}

module.exports = Window