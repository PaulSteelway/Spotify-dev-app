const db = require('../models')
const {
    Builder,
    By,
    Key,
    until,
} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');


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


        const options = new chrome.Options();

        


       
        if (data.proxyAccount) {
            const proxyUrl = `http://${data.proxyAccount.credentials}@${data.proxyAccount.host}`;
            options.setProxy(proxy.manual({
                http: proxyUrl,
                https: proxyUrl
            }))

        }




        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        // console.log('Logging on to Spotify.')
        await driver.get('https://accounts.spotify.com/en/login?continue=https:%2F%2Fopen.spotify.com%2F');
        await driver.findElement(By.id('login-username')).sendKeys(data.account);
        await driver.findElement(By.id('login-password')).sendKeys(data.password, Key.RETURN);

        const sessionScript = await driver.wait(until.elementLocated(By.id('session')));

        const sessionElement = await sessionScript.getAttribute('text')


        const token_info = JSON.parse(sessionElement.trim());

        const cookies = await driver.manage().getCookies();
        let cache = {};
        cookies.forEach(cookie => {
            if (cookie.name === 'sp_dc') {
                cache['refreshToken'] = cookie.value;
            }
        });



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
        
        

        // console.log(save);


        process.on('SIGINT', () => {
            console.log('Interrupted!');
            driver.quit();
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