const fs = require('fs');
const { post, getToken } = require('./utils');

const API = {
    key: "xxx",
    scope: "GIGACHAT_API_PERS"
}
let token = {state:'init'}; // {key, expires_at, error, state, ts} state=init/wait/ok/error


let step = 1;

async function clearAnswers() {
    step = 1;
}

async function getAnswer(msg) {
    try {
        await getToken(token, API);
    } catch (err) {
        return Promise.reject("LLM TOKEN ERROR " + err)
    }

    return new Promise((resolve, reject) => {
        post({
                host: 'gigachat.devices.sberbank.ru',
                port: '443',
                path: '/api/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.key,
                },
                rejectUnauthorized: false
            },
            JSON.stringify({
                "model": "GigaChat",
                "messages": [
                  {
                    "role": "user",
                    "content": msg
                  }
                ],
                "n": step++,
                "stream": false,
                "max_tokens": 512,
                "repetition_penalty": 1,
                "update_interval": 0
              })
        )
        .then(data => {
//console.log('data', data);
            try {
                let res = JSON.parse(data);
                resolve(res.choices[0].message.content)
            } catch (err) {
                reject(err)
            }
        })
        .catch(err => {
            reject(err)
        })
    })
}



module.exports = {
    getAnswer
}