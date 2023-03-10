const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Путь к драйверу Chrome
const driverPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Создание объекта драйвера Chrome
const options = new chrome.Options();
const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .withCapabilities(webdriver.Capabilities.chrome())
  .build();

// Открытие новой вкладки в браузере
driver.get('https://www.google.com');