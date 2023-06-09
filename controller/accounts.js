const db = require('../models')
const {
    Builder,
    By,
    Key,
    until,
} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const USER_AGENT = '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
const fs = require('fs');
const xvfb = require('xvfb');
module.exports.check = async function (id) {

    try {
        const data = await db.accounts.findByPk(id, {
            include: [{
                model: db.proxies,
                as: 'proxyAccount'
            }]
        });
        if (!data) {
            throw new Error('Account not found');
        }
        // console.log(data.account)

        const xvfbInstance = new xvfb();
        xvfbInstance.startSync();

        const options = new chrome.Options();





        if (data.proxyAccount) {
            const proxyUrl = `http://${data.proxyAccount.credentials}@${data.proxyAccount.host}`;
            options.setProxy(proxy.manual({
                http: proxyUrl,
                https: proxyUrl
            }))

        }

        console.log('sdada')
        options.addArguments(USER_AGENT);
        options.addArguments('--disable-gpu');
        options.addArguments('--disable-blink-features=AutomationControlled');
        // options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-setuid-sandbox');
        options.addArguments('--window-size=1920,1080');


        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // await driver.get('https://example.com');
        await driver.get('https://accounts.spotify.com/en/login?continue=https:%2F%2Fopen.spotify.com%2F');

        const loginInput = await driver.wait(until.elementLocated(By.id('login-username')));

        // const login = await driver.findElement(By.id('login-username'));
        await loginInput.click();
        await loginInput.sendKeys(data.account);
        // await driver.findElement(By.id('login-username')).sendKeys(data.account);
        const passwordInput = await driver.wait(until.elementLocated(By.id('login-password')));

        await passwordInput.sendKeys(data.password, Key.RETURN);
        //
        console.log('dadaa')
        await driver.sleep(5000); // задержка в 5 секунд

        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('screenshot.png', screenshot, 'base64');
        console.log('screenshot')
        const sessionScript = await driver.wait(until.elementLocated(By.id('session')));
        console.log('Logging on to Spotify.')
        const sessionElement = await sessionScript.getAttribute('text')

        const token_info = JSON.parse(sessionElement.trim());

        const cookies = await driver.manage().getCookies();
        let cache = {};
        cookies.forEach(cookie => {
            if (cookie.name === 'sp_dc') {
                cache['refreshToken'] = cookie.value;
            }
        });


        console.log('s223a')

        await setTimeout(async () => {
            await driver.quit();
        }, 5000)
        cache['accessToken'] = token_info['accessToken'];
        const save = {
            token: cache,
            cookies
        }
        console.log(cache)
        const result = await db.accounts.update(save, {
            where: {
                id
            },
        });



        console.log(save);


        process.on('SIGINT', () => {
            console.log('Interrupted!');
            driver.quit();
            xvfbInstance.stopSync();
            process.exit();
        });
        // const tokenValidator = new TokenValidator(data);

        // await tokenValidator.generate();
        return 200;
        } catch (error) {
        console.error(error);
        throw new Error('Token generation failed');
    }
}

// Function that saved spotify data to account model
module.exports.SaveSpotify = async function SaveSpotify(id, data) {
    try {
        const result = await db.accounts.update(data, {
            where: {
                id
            },
        });
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
