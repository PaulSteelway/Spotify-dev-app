from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
import json
import base64

class Browser:
    def __init__(self, userdata):
        self.driver = None
        self.userdata = userdata

    def start(self):
        options = webdriver.ChromeOptions()
        proxydata = self.userdata['proxyAccount']
        # if proxydata:
        #     proxyUrl = 'http://{}@{}'.format(proxydata['credentials'], proxydata['host'])
        #     options.add_argument('--proxy-server={}'.format(proxyUrl))

        options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-setuid-sandbox')
        options.add_argument('--window-size=1920,1080')
        self.driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)

        self.driver.get('https://spotify.com')

        cookies = self.userdata.get('cookies')
        if cookies:
            for cookie in cookies:
                self.driver.add_cookie(cookie)

        self.driver.get('https://spotify.com')

        try:
            session = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.ID, 'session')))
        except:
            return 401

        try:
            time.sleep(3)
            closeButtonContainer = self.driver.find_element(By.ID, 'onetrust-close-btn-container')
            if closeButtonContainer:
                closeButton = closeButtonContainer.find_element(By.TAG_NAME, 'button')
                closeButton.click()
                time.sleep(1)
        except:
            pass
        time.sleep(10)
        screenshot = self.driver.get_screenshot_as_base64()
        with open('screenshot.png', 'wb') as f:
            f.write(base64.b64decode(screenshot))
        
        playButton = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'button[data-testid="play-button"]')))
        self.driver.execute_script("arguments[0].click();", playButton)
        time.sleep(10)

        # playButton = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'button[data-testid="play-button"]')))
        # playButton.click()
        # time.sleep(1)

        screenshot = self.driver.get_screenshot_as_base64()
        with open('screenshot.png', 'wb') as f:
            f.write(base64.b64decode(screenshot))
        return 200

    def navigate(self, url):
        self.driver.get(url)

    def stop(self):
        self.driver.quit()
        self.driver = None

cookies = '[{"domain":".spotify.com","expiry":1715116100,"httpOnly":false,"name":"sp_t","path":"/","sameSite":"None","secure":true,"value":"f9e8ebedbf54625ca78df18a16a368b1"},{"domain":".spotify.com","expiry":1715116072,"httpOnly":false,"name":"sp_key","path":"/","sameSite":"None","secure":true,"value":"308f7bd5-bd80-46ff-8bce-9c3f2b274c93"},{"domain":".spotify.com","expiry":1683666473,"httpOnly":true,"name":"sp_landing","path":"/","sameSite":"None","secure":true,"value":"https%3A%2F%2Fopen.spotify.com%2F%3Fsp_cid%3Df9e8ebedbf54625ca78df18a16a368b1%26device%3Ddesktop"},{"domain":".spotify.com","expiry":1715116072,"httpOnly":true,"name":"sp_dc","path":"/","sameSite":"None","secure":true,"value":"AQCEl0hdWbwA84RIrzVgTr1McIrlk4ivTAs8AIIXabqddVd8stGk2ak5Edp04xzDWv6SCU63GRK0RQOSTcPnces4yVkFls2B4cuJNS60SqMg0tPoq5CS0ewrR-N8aN5w-7XPnhfP8KlCV9fILwmsNu-ia8_Ag3c"}]'

userdata = {
    'proxyAccount': {
        'credentials': '',
        'host': 'proxy.example.com'
    },
    'cookies': json.loads(cookies)
}
browser = Browser(userdata)
browser.start()
time.sleep(10)
# browser.navigate('https://example.com')
browser.stop()