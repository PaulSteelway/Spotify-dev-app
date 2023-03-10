const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const fs = require('fs');
const TokenValidator = require('./tokenValidator')
const player = require('./player')
const HttpsProxyAgent = require('https-proxy-agent');

class Browser {
    constructor(userdata) {
        this.driver = null;
        this.userdata = userdata
    }



    async start() {

        const options = new chrome.Options();
        const proxydata = this.userdata.proxyAccount;
        if (proxydata) {

            

            const proxyUrl = `http://${proxydata.credentials}@${proxydata.host}`
            // const proxyUrl = 'http://H0vFDG:XoDcR2@45.92.22.6:8000';
            // options.addArguments(`--proxy-server=${proxyUrl}`); // proxyUrl - URL прокси сервера
            options.setProxy(proxy.manual({
                http:proxyUrl,
                https:proxyUrl
            }))
            // options.setProxy({
            //     proxyType: 'manual',
            //     httpProxy: proxyUrl,
            //     sslProxy: proxyUrl,
            //     noProxy: 'localhost'
            // }); // инициализируем https-proxy-agent
            // Создание Capabilities с использованием прокси
        }

        options.addArguments('--disable-gpu');
        // options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-setuid-sandbox');
        options.addArguments('--window-size=1920,1080');
        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();


        await this.driver.get('https://spotify.com');




        const cookiesString = JSON.stringify(this.userdata.cookies);

        if (this.userdata.cookies) {
            const cookies = JSON.parse(cookiesString);
            for (const cookie of cookies) {
                await this.driver.manage().addCookie(cookie);
            }
        }


        // const sessionStorageString = fs.readFileSync(DIR_PATH+"sessionStorage.json",'utf8',(err)=>{if(err)throw err});
        // const sessionStorage = JSON.parse(sessionStorageString);

        // const localStorageString = fs.readFileSync(DIR_PATH+"localStorage.json",'utf8',(err)=>{if(err)throw err});
        // // const localStorage = JSON.parse(localStorageString);
        // const localStorageData = await driver.executeScript(`Object.keys(arguments[0]).forEach(key => localStorage.setItem(key, arguments[0][key]))`, localStorage);
        // const sessionStorageData = await driver.executeScript(`Object.keys(arguments[0]).forEach(key => sessionStorage.setItem(key, arguments[0][key]))`, sessionStorage);
        // console.log(localStorage);
        this.driver.get('https://spotify.com');


        const session = await this.driver.wait(until.elementLocated(By.id('session')));

        if (!session) {
            return 401
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
            const playButton = await this.driver.wait(until.elementLocated(By.css('button[data-testid="play-button"]')));
            await this.driver.executeScript("arguments[0].click();", playButton);
            await new Promise(resolve => setTimeout(resolve, 10000));

            let screenshot = await this.driver.takeScreenshot();
            fs.writeFileSync('screenshot.png', screenshot, 'base64');

        }
        return 200;
    }

    async navigate(url) {
        await this.driver.get(url);
    }

    async stop() {
        await this.driver.quit();
        this.driver = null;
    }
}

module.exports = Browser;