const db = require('./models')
const TokenValidator = require('./src/tokenValidator');
const {
  Builder,
  By,
  Key,
  until
} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const USER_AGENT = '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';



(async () => {
  const data = await db.accounts.findByPk(1, {
    include: [{
      model: db.proxies,
      as: 'proxyAccount'
    }]
  });
  if (!data) {
    throw new Error('Account not found');
  }

  const options = new chrome.Options();
  const proxydata = data.proxyAccount;
  if (proxydata) {



    const proxyUrl = `http://${proxydata.credentials}@${proxydata.host}`
    // const proxyUrl = 'http://H0vFDG:XoDcR2@45.92.22.6:8000';
    // options.addArguments(`--proxy-server=${proxyUrl}`); // proxyUrl - URL прокси сервера
    options.setProxy(proxy.manual({
      http: proxyUrl,
      https: proxyUrl
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
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-setuid-sandbox');
  options.addArguments('--window-size=1920,1080');
  
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();


  await driver.get('https://spotify.com');






  if (data.cookies) {
    const cookiesString = JSON.stringify(data.cookies);
    const cookies = JSON.parse(cookiesString);
    for (const cookie of cookies) {
      await driver.manage().addCookie(cookie);
    }
  }


  // const sessionStorageString = fs.readFileSync(DIR_PATH+"sessionStorage.json",'utf8',(err)=>{if(err)throw err});
  // const sessionStorage = JSON.parse(sessionStorageString);

  // const localStorageString = fs.readFileSync(DIR_PATH+"localStorage.json",'utf8',(err)=>{if(err)throw err});
  // // const localStorage = JSON.parse(localStorageString);
  // const localStorageData = await driver.executeScript(`Object.keys(arguments[0]).forEach(key => localStorage.setItem(key, arguments[0][key]))`, localStorage);
  // const sessionStorageData = await driver.executeScript(`Object.keys(arguments[0]).forEach(key => sessionStorage.setItem(key, arguments[0][key]))`, sessionStorage);
  // console.log(localStorage);
  driver.get('https://spotify.com');


  const session = await driver.wait(until.elementLocated(By.id('session')));

  if (!session) {
    return 401
  } else {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const closeButtonContainer = await driver.findElement(By.id('onetrust-close-btn-container'));
    if (closeButtonContainer) {
      const closeButton = await closeButtonContainer.findElement(By.tagName('button'));
      await closeButton.click();
    }
    await new Promise(resolve => setTimeout(resolve, 2220));

    const playButton = await driver.wait(until.elementLocated(By.css('button[data-testid="play-button"]')));
    await driver.executeScript("arguments[0].click();", playButton);
    await new Promise(resolve => setTimeout(resolve, 10000));

    let screenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshot.png', screenshot, 'base64');

  }

  // const tokenValidator = new TokenValidator(data);
  // const Player = new player(tokenValidator);




})();