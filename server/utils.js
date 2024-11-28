const https = require('https');
const get_uuid = require('uuid').v4;

//[https.request example from https://stackoverflow.com/questions/6158933/how-is-an-http-post-request-made-in-node-js]
async function post(opt, body) {
    opt.method='POST';
    return new Promise((resolve, reject) => {
        let post_req = https.request(opt, function(res) {
            //res.setEncoding('utf8');
            let chunks = []
            res.on('data', function (chunk) {
                //chunks.push(chunk);
                chunks.push(Buffer.from(chunk, 'binary'));
            });
            res.on('end', function () {
                //resolve(chunks.join(''));
                resolve(Buffer.concat(chunks));
            })
            res.on('timeout', function () {
                reject('timeout')
            })
            res.on('error', function (err) {
                reject(err)
            })
            res.on('abort', function (err) {
                reject(abort)
            })
        });
        if (body) post_req.write(body);
        post_req.end();
    })
}

async function getToken(token, opt) {
// token = {key, expires_at, error, state, ts} state=init/wait/ok/error
//         initialization: let token = {state:'init'};
// opt = {api_key, scope}
    return new Promise((resolve, reject) => {
        if (token.state === 'init' 
            || (token.state==='ok' && (token.expires_at - Date.now() < 10000)) 
            || (token.state==='error' && (Date.now() - token.ts > 1000)) 
        ) {
            resolve(updateToken(token, opt))
        } else {
            if (token.state === 'ok') {
                resolve(token)
            } else {
                reject(token.error)
            }
        }
    })
}

function setTokenError(token, err) {
    token.state = 'error'
    token.error = err
    delete token.key
    delete token.expires_at
    token.ts = Date.now()
}

//[https.request example from https://stackoverflow.com/questions/6158933/how-is-an-http-post-request-made-in-node-js]
async function updateToken(token, opt) { // opt = {api_key, scope}
    return new Promise((resolve, reject) => {
        token.state = 'wait'
        post({
                host: 'ngw.devices.sberbank.ru',
                port: '9443',
                path: '/api/v2/oauth',
                headers: {
                    'Authorization': 'Basic ' + opt.key,
                    'RqUID': get_uuid(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                rejectUnauthorized: false
            },
            encodeURI("scope="+opt.scope)
        )
        .then(data => {
            try {
                let res = JSON.parse(data);
                if (res.access_token) {
                    token.state = 'ok'
                    delete token.error
                    token.key = res.access_token
                    token.expires_at = res.expires_at
                    token.ts = Date.now()
                    resolve(token)
                } else {
                    setTokenError(token, res.message);
                    reject(token.error)
                }
            } catch (err) {
                setTokenError(token, err);
                reject(token.error)
            }
        })
        .catch(err => {
            setTokenError(token, err);
            reject(token.error)
        })
    })
}




module.exports = {
    post,
    getToken
}
