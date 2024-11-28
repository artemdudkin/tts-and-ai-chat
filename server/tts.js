const fs = require('fs');
const { post, getToken } = require('./utils');

const API = {
    key: "xxx",
    scope: "SALUTE_SPEECH_PERS"
}
let token = {state:'init'}; // {key, expires_at, error, state, ts} state=init/wait/ok/error




async function getText(fn) {
    try {
        await getToken(token, API);
    } catch (err) {
        return Promise.reject("TTS TOKEN ERROR " + err)
    }

    const data = fs.readFileSync(fn);

    return new Promise((resolve, reject) => {
        post({
                host: 'smartspeech.sber.ru',
                port: '443',
                path: '/rest/v1/speech:recognize',
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Authorization': 'Bearer ' + token.key,
                },
                rejectUnauthorized: false
            },
            data
        )
        .then(data => {
            try {
                let res = JSON.parse(data);
                if (res.status === 200) {
                    resolve(res.result)
                } else {
                    reject(res.message)
                }
            } catch (err) {
                reject(err)
            }
        })
        .catch(err => {
            reject(err)
        })
    })
}


async function getVoice(msg) {
    try {
        await getToken(token, API);
    } catch (err) {
        return Promise.reject("TTS TOKEN ERROR " + err)
    }

    return new Promise((resolve, reject) => {
        post({
                host: 'smartspeech.sber.ru',
                port: '443',
                path: '/rest/v1/text:synthesize?format=opus',
                headers: {
                    'Content-Type': 'application/text',
                    'Authorization': 'Bearer ' + token.key,
                },
                rejectUnauthorized: false
            },
            msg
        )
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    getText,
    getVoice
}