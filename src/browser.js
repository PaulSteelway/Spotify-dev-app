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
const USER_AGENT = '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

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
        options.addArguments(USER_AGENT);
        options.addArguments('--disable-gpu');
        options.addArguments('--disable-blink-features=AutomationControlled');
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

        
        this.driver.get('https://spotify.com');


        const session = await this.driver.wait(until.elementLocated(By.id('session')));

        if (! session) {
            return 401
        } else {
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 10000)));
            try {
                const closeButtonContainer = await this.driver.findElement(By.id('onetrust-close-btn-container'));
                if (closeButtonContainer) {
                  const closeButton = await closeButtonContainer.findElement(By.tagName('button'));
                  await closeButton.click();
                  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 10000)));
                }
              } catch (error) {
                console.log(error);
                // Обработка ошибки
              }

            const playButton = await this.driver.wait(until.elementLocated(By.css('button[data-testid="play-button"]')));
            if (!playButton){
                return "error";
            }
            await this.driver.executeScript("arguments[0].click();", playButton);
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 10000)));

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