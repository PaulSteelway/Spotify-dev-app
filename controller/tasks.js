const db = require('../models')
const TokenValidator = require('../src/tokenValidator');
const player = require('../src/player');
const axios = require('axios');
const Browser = require('../src/browser');

module.exports.Get = async function (id, type) {
    try {
        let data = await db.tasks.findByPk(id, {
            include: [{
                model: db.accounts,
                as: 'taskAccount',
                include: [{
                    model: db.proxies,
                    as: 'proxyAccount'
                }]
            }]

        });

        if (!data) {
            throw new Error(`Task with id ${id} not found`);
        }

        // type = 'artist';
        // data.target = '6YXbPlxhFq1u9wRF3MiGTb';
       
        const browser = new Browser(data.taskAccount);
        await browser.start();
        const tokenValidator = new TokenValidator(data.taskAccount);
        const Player = new player(tokenValidator);

        const check = await tokenValidator.checkTokenValidity();
        if (check.error && check.error.status == 401) {
            await tokenValidator.refreshAccessToken()
        }
        await db.tasks.update({
            status: 'process'
        }, {
            where: {
                id
            }
        })
        let result, arr;
        let total_duration = 10000;
        switch (type) {
            case 'artist':
                result = await tokenValidator.sendRequest(`/v1/artists/${data.target}/top-tracks?country=US`, 'get');
                arr = result.tracks.map((item) => item.uri)
                result.trakcs.forEach(track => {
                    total_duration += parseInt(track.duration_ms);
                });
                break;
            case 'playlist':
                result = await tokenValidator.sendRequest(`/v1/playlists/${data.target}/tracks`)
                arr = result.items.map((item) => item.track.uri)
                result.items.forEach(track => {
                    total_duration += parseInt(track.track.duration_ms);
                });
                break;
            case 'track':
                result = await tokenValidator.sendRequest(`/v1/tracks/${data.target}`)
                arr = [result.uri]
                total_duration + 200000;
                break;
        }

        const device = await Player.getStatus()
        console.log("device:",device);
        if (!device.error) {
            const play = await Player.play(arr);
            // console.log(da)
            // return play
        }

        await new Promise(resolve => setTimeout(resolve, total_duration));
        await browser.stop();

        await db.tasks.update({
            status: 'finish'
        }, {
            where: {
                id
            }
        })

    } catch (error) {
        // обработка ошибки
        console.error(`Error while processing task ${id}: ${error.message}`);
        await db.tasks.update({
            status: 'error',
            log: `${error.message}`
        }, {
            where: {
                id
            }
        })
        throw error;
    }
};

module.exports.like = async function (id, type) {
    try {
        let data = await db.tasks.findByPk(id, {
            include: [{
                model: db.accounts,
                as: 'taskAccount',
                include: [{
                    model: db.proxies,
                    as: 'proxyAccount'
                }]
            }]
        });

        if (!data) {
            throw new Error(`Task with id ${id} not found`);
        }
        // type = 'artist';
        // data.target = '6RTZjJ3ELRU7gBCGL6L6ZR';
        const tokenValidator = new TokenValidator(data.taskAccount);
        const check = await tokenValidator.checkTokenValidity();
        if (check.error && check.error.status == 401) {
            await tokenValidator.refreshAccessToken()
        }
        switch (type) {
            case 'artist':
                // let put = 
                result = await tokenValidator.sendRequest(`/v1/me/following?type=artist&ids=${data.target}`, 'PUT');
                break;
            case 'playlist':
                result = await tokenValidator.sendRequest(`/v1/playlists/${data.target}/followers`, 'PUT');
                break;
            case 'track':
                result = await tokenValidator.sendRequest(`/v1/me/tracks?ids=${trackId}`, 'PUT');
                break;
        }

        await db.tasks.update({
            status: 'finish'
        }, {
            where: {
                id
            }
        })


    } catch (error) {
        // обработка ошибки
        console.error(`Error while processing task ${id}: ${error.message}`);
        await db.tasks.update({
            status: 'error',
            log: `${error.message}`
        }, {
            where: {
                id
            }
        })

        throw error;
    }
}


module.exports.Get2 = async function (id, type) {
    try {
        let data = await db.tasks.findByPk(id, {
            include: [{
                model: db.accounts,
                as: 'taskAccount'
            }]
        });
        if (!data) {
            throw new Error(`Task with id ${id} not found`);
        }
        //   type = 'playlist';
        //   data.target = '37i9dQZF1EIVrR0Tgpwmgr';
        const tokenValidator = new TokenValidator(data.taskAccount);
        const Player = new player(tokenValidator);

        const check = await tokenValidator.checkTokenValidity();
        if (check.error && check.error.status == 401) {
            await tokenValidator.refreshAccessToken()
        }
        const device = await Player.getStatus()
        return device

    } catch (error) {
        // обработка ошибки
        console.error(`Error while processing task ${id}: ${error.message}`);
        throw error;
    }
}