// Note that 'request' is deprecated: https://github.com/request/request/issues/3142
const axios = require('axios');
const
    BASE_URL = 'gew-spclient.spotify.com',
    USER_AGENT = "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:71.0) Gecko/20100101 Firefox/71.0";
ACTIONS = {
    LOCAL: '/connect-state/v1/player/command/from/',
    TRANSFER: '/connect-state/v1/connect/transfer/from/',
}
class player {
    constructor(session) {
        this.session = session;
        this.currentDevice = null;
        this.isPlaying = false;
        this.auth = session.accessToken;
    }

    async getBody(context) {
        var _options = [];
        if (typeof context === 'string') {
            _options.context_uri = context;
            return (JSON.stringify(Object.assign({}, _options)));
        } else {
            _options.uris = context
            return (JSON.stringify(Object.assign({}, _options)));
        }
    }

    async set_shuffle(state) {
        const headers = {
            'Authorization': `Bearer ${this.auth}`,
            'Content-Type': 'application/json'
        };
        await this.getStatus();

        const options = {
            url: `https://api.spotify.com/v1/me/player/shuffle?state=${state}`,
            method: 'PUT',
            headers: headers,
        };

        try {
            const response = await axios(options);
            console.log(response.data);
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async play(input) {
        const headers = {
            'Authorization': `Bearer ${this.auth}`,
            'User-Agent': USER_AGENT,
        };

        const postData = await this.getBody(input);


        const options = {
            url: 'https://api.spotify.com/v1/me/player/play',
            method: 'PUT',
            headers: headers,
            data: postData
        };

        try {
            const response = await axios(options);
            
        } catch (error) {
            console.error(`Error: ${error}`);
            return error;
        }
        finally{
            return 200;
        }
    }

    async play_pause() {
        const headers = {
            'Authorization': `Bearer ${this.auth}`,
            'Content-Type': 'application/json'
        };

        let action = 'play';
        await this.getStatus();

        if (this.isPlaying) {
            action = 'pause';
        }

        const options = {
            url: `https://api.spotify.com/v1/me/player/${action}`,
            method: 'PUT',
            headers: headers,
        };

        try {
            const response = await axios(options);
            console.log(response.data);
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async set_repeat(state) {
        const headers = {
            'Authorization': `Bearer ${this.auth}`,
            'Content-Type': 'application/json'
        };
        await this.getStatus()
        const options = {
            url: `https://api.spotify.com/v1/me/player/repeat?state=${state}`,
            method: 'PUT',
            headers: headers
        };

        try {
            const response = await axios(options);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    async set_volume(percent) {
        const headers = {
            'Authorization': `Bearer ${this.auth}`,
            'Content-Type': 'application/json'
        };
        await this.getStatus()
        const options = {
            url: `https://api.spotify.com/v1/me/player/volume?volume_percent=${percent}`,
            method: 'PUT',
            headers: headers
        };

        try {
            const response = await axios(options);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    async set_position(position_ms) {
        console.log(position_ms);
        const headers = {
            'Authorization': `Bearer ${this.auth}`,
            'Content-Type': 'application/json'
        };
        await this.getStatus()
        const options = {
            url: `https://api.spotify.com/v1/me/player/seek?position_ms=${Math.floor(position_ms)}`,
            method: 'PUT',
            headers: headers
        };

        try {
            const response = await axios(options);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    async transfer_and_play(target_device) {
        const headers = {
            'Authorization': `Bearer ${this.auth}`,
            'Content-Type': 'application/json'
        };
        const _options = {
            device_ids: [target_device],
            play: true
        };
        const postData = JSON.stringify(_options);
        const options = {
            url: 'https://api.spotify.com/v1/me/player',
            method: 'PUT',
            headers: headers,
            data: postData
        };

        try {
            const response = await axios(options);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    async getStatus(device = null) {

        const result = await this.session.sendRequest('/v1/me/player')
        if (!result.device)return {error:{message:"Not device"}}
        if (device == null) this.currentDevice = result.device.id;
        
        else this.currentDevice = device;
        console.log(result);
        this.isPlaying = result.is_playing;
        
        return result.device.id;
    }
}
module.exports = player;