const express = require('express');
const router = express.Router();
const db = require('../models');
// const HttpsProxyAgent = require('https-proxy-agent');
const Proxy = db.proxies;
const axios = require('axios-https-proxy-fix');
// Получение всех прокси
router.get('/', async (req, res) => {
    try {
        const proxies = await Proxy.findAll();
        res.render('proxies/index', {
            proxies,
            currentPage: '/proxy'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

router.post('/:id/check', async (req, res) => {


    const testUrl = 'https://www.example.com'; // URL для проверки

    try {
        const proxy = await Proxy.findByPk(req.params.id);
        if (!proxy) {
            return res.status(404).send('Proxy not found');
        }

        const config = {
            proxy: {
              host: proxy.host.split(':')[0],
              port: parseInt(proxy.host.split(':')[1]),
              auth: {
                username: proxy.credentials.split(':')[0],
                password: proxy.credentials.split(':')[1]
              }
            }
          };
          console.log(config)
        // const agent = new HttpsProxyAgent({
        //     host: proxy.host.split(':')[0],
        //     port: parseInt(proxy.host.split(':')[1]),
        //     auth: proxy.credentials
        //   });
        const response = await axios.get(testUrl, config);
        console.log(response)
        // Проверяем статус ответа
        if (response.status === 200) {
            await proxy.update({
                active: true
            });
            res.redirect('/proxy');
            // res.send({
            //     status: 'working'
            // });
        } else {

            await proxy.update({
                active: false
            });
            res.redirect('/proxy');
            // res.send({
            //     status: 'not working'
            // });
        }
    } catch (error) {

        res.redirect('/proxy');
        // res.send({
        //     status: 'not working'
        // });
    }
});


router.get('/new', (req, res) => {
    res.render('proxies/new', {
        currentPage: '/proxies'
    });
});
router.get('/:id/edit', async (req, res) => {
    const id = req.params.id;
    try {
        const proxy = await Proxy.findByPk(id);

        if (!proxy) {
            return res.status(404).send('Proxy not found');
        }
        res.render('proxies/edit', {
            proxy,
            currentPage: '/proxy'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// Получение прокси по ID
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const proxy = await Proxy.findByPk(id);
        if (!proxy) {
            return res.status(404).send('Proxy not found');
        }
        res.render('proxies/show', {
            proxy,
            currentPage: '/proxy'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// Создание прокси
router.post('/', async (req, res) => {
    const {
        host,
        credentials,
        active
    } = req.body;
    try {
        const proxy = await Proxy.create({
            host,
            credentials,
            active
        });
        res.render('proxies/show', {
            proxy,
            currentPage: '/proxy'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// Обновление прокси по ID
router.post('/:id', async (req, res) => {
    const id = req.params.id;
    const {
        host,
        credentials,
        active
    } = req.body;
    try {
        const proxy = await Proxy.findByPk(id);
        if (!proxy) {
            return res.status(404).send('Proxy not found');
        }
        proxy.host = host;
        proxy.credentials = credentials;
        proxy.active = active;
        await proxy.save();
        res.render('proxies/show', {
            proxy,
            currentPage: '/proxy'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// Удаление прокси по ID
router.post('/:id/delete', async (req, res) => {
    const id = req.params.id;
    try {
        const proxy = await Proxy.findByPk(id);
        if (!proxy) {
            return res.status(404).send('Proxy not found');
        }
        await proxy.destroy();
        res.redirect('/proxy');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
