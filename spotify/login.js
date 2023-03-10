const fs = require('fs');
const path = require('path');

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const {By} = require('selenium-webdriver');
// Путь к драйверу Chrome
const driverPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR_PATH = path.join(__dirname, `../static/mr@hsrec.com/`);

// Создание объекта драйвера Chrome

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
const start = async (id,userdata) => {
    // await innit();
    const options = new chrome.Options();
const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .withCapabilities(webdriver.Capabilities.chrome())
  .build();

// Открытие новой вкладки в браузере
    // const DIR_PATH = path.join(__dirname, `../static/fidgeraldsson@gmail.com/`);
    await driver.get('https://spotify.com');


  

    // const cookiesString = fs.readFileSync(DIR_PATH+"cookies.json",'utf8',(err)=>{if(err)throw err});
    // console.log(cookiesString)
    const cookiesString = userdata.cookies;

    if (userdata.cookies){
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

    
    const session = await driver.findElement(By.id('session'))
    
    if (!session){
      return 401
    }
    else{
    }
    return 200;
    

    // await page.evaluate((data) => {
    //     console.log(sessionStorage)
    //     for (const [key, value] of Object.entries(data)) {
    //         sessionStorage[key] = value;
    //     }
    // }, sessionStorage);

    // await page.evaluate((data) => {
    //     for (const [key, value] of Object.entries(data)) {
    //         localStorage[key] = value;
    //     }
    // }, localStorage);
    // await page.goto('https://accounts.spotify.com/en/login?continue=https:%2F%2Fopen.spotify.com%2F');
    process.on('SIGINT', () => {
      console.log('Interrupted!');
      driver.quit();
      process.exit();
    });
};
start()