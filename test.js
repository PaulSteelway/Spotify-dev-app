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
const check = async function () {

    // try {
        const data = {
          account:'fidgeraldsson@gmail.com',
          password:'Qwerty!@#$%'
        }

        const options = new chrome.Options();






        console.log('start')
        options.addArguments(USER_AGENT);
        options.addArguments('--disable-gpu');
        options.setChromeBinaryPath('/usr/bin/google-chrome');
        options.addArguments('--disable-blink-features=AutomationControlled');
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-setuid-sandbox');
        options.addArguments('--window-size=1920,1080');
        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();


        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // await driver.get('https://example.com');
        await driver.get('https://accounts.spotify.com/en/login?continue=https:%2F%2Fopen.spotify.com%2F');

        const loginInput = await driver.wait(until.elementLocated(By.id('login-username')));

        // const login = await driver.findElement(By.id('login-username'));
        await loginInput.click();
        await loginInput.sendKeys('fidgeraldsson@gmail.com');
        // await driver.findElement(By.id('login-username')).sendKeys(data.account);
        const passwordInput = await driver.wait(until.elementLocated(By.id('login-password')));

        await passwordInput.sendKeys('Qwerty!@#$%', Key.RETURN);
        //
        console.log('dadaa')
        await driver.sleep(5000); // задержка в 5 секунд

        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('screenshot.png', screenshot, 'base64');
        console.log('screenshot')
        const sessionScript = await driver.wait(until.elementLocated(By.id('session')));
        console.log('Logging on to Spotify.')
        const sessionElement = await sessionScript.getAttribute('text')
        //
        //
        // const token_info = JSON.parse(sessionElement.trim());
        //
        // const cookies = await driver.manage().getCookies();
        // let cache = {};
        // cookies.forEach(cookie => {
        //     if (cookie.name === 'sp_dc') {
        //         cache['refreshToken'] = cookie.value;
        //     }
        // });
        //
        //

        console.log('s223a')
        //
        // await setTimeout(async () => {
        //     await driver.quit();
        // }, 5000)
        // cache['accessToken'] = token_info['accessToken'];
        // const save = {
        //     token: cache,
        //     cookies
        // }
        // console.log(cache)
        // const result = await db.accounts.update(save, {
        //     where: {
        //         id
        //     },
        // });
        //
        //
        //
        // console.log(save);
        console.log(driver)
        console.log('finish')
        process.on('SIGINT', () => {
            console.log('Interrupted!');
            driver.quit();
            process.exit();
        });
        // const tokenValidator = new TokenValidator(data);

        // await tokenValidator.generate();
        return 200;
        // } catch (error) {
        // console.error(error);
        // throw new Error('Token generation failed');
    }
// }
check()
