
// TODO логировать запросы
// TODO если недоступен Sber TTS то сервер падает

const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const multer = require('multer');
const { exec } = require('child_process');
const { getText, getVoice } = require('./tts');
const { getAnswer, clearAnswers } = require('./llm');



const DATA_FOLDER = '../html2'
const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, DATA_FOLDER+'/upload');
    },
    filename(req, file, cb) {
      const fileNameArr = file.originalname.split('.');
      cb(null, `${Date.now()}.i.${fileNameArr[fileNameArr.length - 1]}`);
    },
});
const upload = multer({ storage });
  




const app = express();

app.use(express.static(DATA_FOLDER))

let waiting_answer=0; // {Integer} флаг, что ответ генерится

app.post('/record', upload.single('audio'), (req, res) => {
  waiting_answer++;
  // clear audio noise [from https://superuser.com/questions/733061/reduce-background-noise-and-optimize-the-speech-from-an-audio-clip-using-ffmpeg]
  const fn = path.join(req.file.destination, req.file.filename);
  exec(`ffmpeg -i "${fn}" -af "highpass=f=200, lowpass=f=3000" "${fn+'.cvrt.mp3'}"`, (err, stdout, stderr) => {
    if (err) {
      console.log("CONVERT ERROR", err);
    } else {
      try{ fs.renameSync(fn+'.cvrt.mp3', fn); } catch (err) {console.log("MOVE CONVERT ERROR", err)}  
    }
    //console.log(`stdout: ${stdout}`);
    //console.log(`stderr: ${stderr}`);

    console.log('>>', fn);

    getText( fn)
    .then(data=>{
      const txt = data.join('. ');
      console.log('<<', txt);
      fs.writeFileSync(fn.replaceAll('.i.mp3', '.i.txt'), txt, "utf8")
      res.json({success:true})

      //generating answer (in background as user see it)
      getAnswer(txt)
      .then(answer=>{
        console.log('<<', answer);
        let fn_answer = path.join(req.file.destination, `${Date.now()}.o.txt`)
        fs.writeFileSync(fn_answer, answer, "utf8")

        getVoice(answer)
        .then(data=>{
          let fn_ogg = fn_answer.replaceAll('.txt', '.ogg');
          console.log('<<', fn_ogg);
          fs.writeFileSync(fn_ogg, data, 'binary')

          exec(`ffmpeg -i "${fn_ogg}" "${fn_ogg.replaceAll(".ogg", ".mp3")}"`, (err, stdout, stderr) => {
            //res.json({success:true})
            waiting_answer--;
          })
        })
      })
    })
    .catch(()=>{
      waiting_answer--;
      res.json({success:true})
    });
  });

});


app.get('/recordings', (req, res) => {
    const folder = path.join(__dirname, DATA_FOLDER+'/upload')
    let files = fs.readdirSync(folder);
    files = files.filter((file) => {
      const fileNameArr = file.split('.');
      return fileNameArr[fileNameArr.length - 1] === 'mp3';
    }).map((file) => {
      let text;
      try{ text = fs.readFileSync(path.join(folder, file.replaceAll('.mp3', '.txt')), 'utf8'); } catch (err) {}
      return {file:`/upload/${file}`, text}
    });
    return res.json({ success: true, files, waiting_answer });
});


app.get('/clear', (req, res) => {
  waiting_answer=0
  clearAnswers();

  const folder = path.join(__dirname, DATA_FOLDER+'/upload')
  let files = fs.readdirSync(folder);
  for (const file of files) fs.unlinkSync(path.join(folder, file))

  return res.json({ success: true});
})


const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.crt');
var credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);