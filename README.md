# tts-and-ai-chat

> POC voice AI chat


## Installation

1. install ffmpeg
2. get [Sber SaluteSpeech API key](https://developers.sber.ru/docs/ru/salutespeech/authentication) and insert it in server\tts.js API.key 
3. get [Sber GIgachat API key](https://developers.sber.ru/docs/ru/gigachat/quickstart/ind-using-api) and insert it in server\llm.js API.key 
4. install libs
```js
npm i
```
5. run server
```
cd server
node index.js
```


## Usage

1. Look at https://localhost
2. Press button with microphone before speaking and another press after you stop speaking
3. Wait a little and listen AI answer
4. Press 'clear' button when you bored


## License

MIT