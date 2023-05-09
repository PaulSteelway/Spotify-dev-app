const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  Builder,
  By,
  Key,
  until
} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const proxy = require('selenium-webdriver/proxy');

const {
  BroadcasterResult
} = require('typeorm/subscriber/BroadcasterResult');

const Acc = require('../controller/accounts')
// const SPOTIFY_USER = "mr@hsrec.com";
// const SPOTIFY_PWD = "500569500569";
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
// const FILE_PATH = path.join(__dirname, `../static/${SPOTIFY_USER}/OAuth.json`);
// const DIR_PATH = path.join(__dirname, `../static/${SPOTIFY_USER}/`);
class TokenValidator {
  constructor(user) {

    this.user = user.account;
    this.password = user.password;
    this.id = user.id
    const cache = user.token;
    this.isAuthorized = false;
    this.accessTokenExpiration = null;
    this.isAlive = null;
    this.proxy = null;
    this.proxyAgent = null;
    if (user.proxyAccount) {
      this.proxyAgent = new HttpsProxyAgent({
        host: user.proxyAccount.host.split(':')[0],
        port: parseInt(user.proxyAccount.host.split(':')[1]),
        auth: user.proxyAccount.credentials
      });
      this.proxy = `http://${user.proxyAccount.credentials}@${user.proxyAccount.host}`;
    }
    if (cache) {
      this.accessToken = cache.accessToken;
      this.refreshToken = cache.refreshToken;
      this.isAuthorized = false
    }
  }


  async sendRequest(apiCall, method = 'get', data = null) {

    // if (this.isAlive == null && apiCall != '/v1/me') {
    //   const valid = await this.checkTokenValidity();
    //   if (valid.error && valid.error.status == 401) {

    //     const val = await this.refreshAccessToken();
    //     if (!val.accessToken) return valid;
    //   }
    //   this.isAlive = true;
    // }
    if (this.isAuthorized === null) {
      return "Token is not provided";
    }

    let config = {
      url: `https://api.spotify.com${apiCall}`,
      method: method,
      headers: {
        Accept: '*/*',
        'User-Agent': USER_AGENT,
        cookie: `sp_dc=${this.refreshToken}`,
        Authorization: `Bearer ${this.accessToken}`,
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      }
    };

    if (data) {
      config.data = data;
    }
    // console.log('dsadasdsa')
    if (this.proxyAgent) {
      config.httpsAgent = this.proxyAgent;
    }
    try {
      // console.log('dsadas22dsa')

      const response = await axios(config);
      // console.log(response.data)
      // axios(config)
      // .then(response => {
      //   const result = response.data;
      //   console.log('Результат:', result);

      // })
      // .catch(error => {
      //   console.error('Ошибка:', error);
      // });
      const result = response.data;
      return result;


    } catch (error) {
      // console.log('request failed:', error.response.data);
      if (error.response && error.response.data) return error.response.data
      return error;
    }
  }


  // async sendRequest(apiCall, method = 'get') {

  //   // if (this.isAlive == null && apiCall != '/v1/me'){
  //   //   const valid = await this.checkTokenValidity();
  //   //   if (valid.error && valid.error.status == 401){

  //   //       const val = await this.refreshAccessToken();
  //   //       if (!val.accessToken)return valid;
  //   //   }
  //   //   this.isAlive = true;
  //   // }

  //   if(this.isAuthorized===null){
  //     return "Token is not provided";
  //   }
  //   return new Promise((resolve, reject) => {
  //     if (method == 'get') {
  //       https.get({
  //         host: 'api.spotify.com',
  //         path:apiCall,
  //         headers: {
  //           Accept: '*/*',
  //           'User-Agent': USER_AGENT,
  //           cookie: `sp_dc=${this.refreshToken}`,
  //           Authorization: `Bearer ${this.accessToken}`,
  //           'Sec-Fetch-Mode': 'cors',
  //           'Sec-Fetch-Site': 'same-site'
  //         }
  //       }, (res) => {
  //         let body = '';

  //         res.on('data', (data) => {
  //           body += data;
  //         });
  //         res.on('end', () => {
  //           if (body) {
  //             const result = JSON.parse(body);
  //             console.log(result)
  //             console.log('da')
  //             resolve(result);

  //           }
  //         });
  //       }).on('error', (e) => {
  //         console.log('request failed: ', e.message);
  //         reject(e);
  //       });

  //     }
  //     else {

  //       https.request({
  //         method:'PUT',
  //         host:BASE_URL,
  //         path:encodeURI(apiCall),
  //         headers: {
  //           Accept: '*/*',
  //           'User-Agent': USER_AGENT,
  //           Authorization: `Bearer ${this.accessToken}`,
  //           'Sec-Fetch-Mode': 'cors',
  //           'Sec-Fetch-Site': 'same-site'
  //         }
  //       }, (follow_response) => {
  //         if (follow_response.statusCode !== 401) {
  //           console.log(follow_response.statusCode)
  //         } else {
  //           // console.log('da')
  //           this.refreshAccessToken()
  //         }

  //       })
  //       .on('error', (error) => {
  //         console.error(error);
  //       })
  //       .end();
  //     }
  //   });

  // }

  async checkTokenValidity() {
    console.log('check56')
    const req = await this.sendRequest('/v1/me');
    console.log(req)
    return req;
  }
  async refreshAccessToken() {
    try {
      let config = {
        headers: {
          Accept: '*/*',
          cookie: `sp_dc=${this.refreshToken}`,
          'User-Agent': USER_AGENT,
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site'
        }
      }
      if (this.proxyAgent) {
        config.httpsAgent = this.proxyAgent;
      }
      const response = await axios.get('https://open.spotify.com/get_access_token?reason=transport', config);
      console.log('check2')

      const result = response.data;

      this.accessToken = result.accessToken;

      const save = await Acc.SaveSpotify(this.id, {
        token: {
          accessToken: result.accessToken,
          refreshToken: this.refreshToken
        }
      });

      return result;
    } catch (error) {
      console.error(error.response.data, apiCall);
      return error.response.data
    }
  }

  // async refreshAccessToken() {
  //   return new Promise((resolve, reject) => {
  //     https.get({
  //       host: 'open.spotify.com',
  //       path: '/get_access_token?reason=transport',
  //       headers: {
  //         Accept: '*/*',
  //         cookie: `sp_dc=${this.refreshToken}`,
  //         'User-Agent': USER_AGENT,
  //         'Sec-Fetch-Mode': 'cors',
  //         'Sec-Fetch-Site': 'same-site'
  //       }
  //     }, (res) => {
  //       let body = '';
  //       res.on('data', (data) => {
  //         body += data;

  //       });
  //       res.on('end', async () => {
  //         const result = JSON.parse(body);

  //         try {
  //           // console.log(result)
  //           this.accessToken = result.accessToken;
  //         } catch (e) {
  //           this.isAuthorized = false;
  //           // console.log(e)
  //         } finally {
  //           const save = await Acc.SaveSpotify(this.id,{token:{accessToken: result.accessToken,
  //             refreshToken: this.refreshToken}})
  //           resolve(result);
  //         }
  //       });
  //     });
  //   });
  // }
  async generate() {
    // await this.refreshAccessToken()
    // if (!this.isAuthorized) {
    console.log('Refresh token has expired or was not retrieved.')
    const options = new chrome.Options();
    if (this.proxy) {





      options.setProxy(proxy.manual({
        http: this.proxy,
        https: this.proxy
      }))

    }
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    // console.log('Logging on to Spotify.')
    await driver.get('https://accounts.spotify.com/en/login?continue=https:%2F%2Fopen.spotify.com%2F');
    await driver.findElement(By.id('login-username')).sendKeys(this.user);
    await driver.findElement(By.id('login-password')).sendKeys(this.password, Key.RETURN);

    const sessionScript = await driver.wait(until.elementLocated(By.id('session')));

    const sessionElement = await sessionScript.getAttribute('text')


    const token_info = JSON.parse(sessionElement.trim());

    const cookies = await driver.manage().getCookies();

    cookies.forEach(cookie => {
      if (cookie.name === 'sp_dc') {
        this.refreshToken = cookie.value;
      }
    });



    await setTimeout(async () => {

      // const sessionStorage = await driver.executeScript(() => JSON.stringify(sessionStorage));
      // const localStorage = await driver.executeScript(() => JSON.stringify(localStorage));



      // await require('fs').promises.writeFile(`${DIR_PATH}cookies.json`, JSON.stringify(cookies), 'utf8');
      // await require('fs').promises.writeFile(`${DIR_PATH}sessionStorage.json`, sessionStorage, 'utf8');
      // await require('fs').promises.writeFile(`${DIR_PATH}localStorage.json`, localStorage, 'utf8');
      await driver.quit();
    }, 5000)
    this.accessToken = token_info['accessToken'];
    this.clientId = token_info['clientId'];
    this.accessTokenExpiration = token_info['accessTokenExpirationTimestampMs'];
    // }
    const cache = {
      'accessToken': this.accessToken,
      'refreshToken': this.refreshToken
    }

    const save = await Acc.SaveSpotify(this.id, {
      token: cache,
      cookies
    })

    // console.log(save);


    process.on('SIGINT', () => {
      console.log('Interrupted!');
      driver.quit();
      process.exit();
    });
    return 200;
  }
}

// token.sendRequest('/v1/me/following?type=artist&ids=4FYIy3bsaDrvC0LuW2kqzW', 'post')
// token.checkTokenValidity();

module.exports = TokenValidator;