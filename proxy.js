const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const HttpsProxyAgent = require('https-proxy-agent');
const {
    Builder,
    By,
    Key,
    until,
} = require('selenium-webdriver');

const { WebDriverWait } = require('selenium-webdriver/lib/webdriver');
(async function example() {
  const options = new chrome.Options();

  const proxyUrl = 'http://45.92.22.6:8000';
  const credentials = 'H0vFDG:XoDcR2';
  const proxyAgent = new HttpsProxyAgent({auth:credentials,httpProxy:proxyUrl});

  options.setProxy(proxy.manual({
    http: proxyUrl,
    https: proxyUrl,
    ftp: proxyUrl,
    ssl: proxyUrl,
    noProxy: 'localhost',
    agent:proxyAgent
    // proxyAuthorization: `Basic ${Buffer.from(credentials).toString('base64')}`
  }));

  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-setuid-sandbox');
  options.addArguments('--window-size=1920,1080');

  const driver = await new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    // .setProxy(proxyAgent)
    .build();

  await driver.get('https://www.whatismyip.com/');
  await new Promise(resolve => setTimeout(resolve, 10000));
  const wait = new WebDriverWait(driver, 10000);
  wait.until(until.alertIsPresent()).then(() => {
    const alert = driver.switchTo().alert();
    alert.sendKeys('username\npassword');
    alert.accept();
  });
  await alert.sendKeys(`${proxyUser}\t${proxyPass}\n`);
//   await driver.quit();
})();
