# tts-and-ai-chat

> POC voice AI chat


## Installation

1. install [node.js](https://nodejs.org/en)
2. install ffmpeg
3. get [Sber SaluteSpeech API key](https://developers.sber.ru/docs/ru/salutespeech/authentication) and insert it in server\tts.js API.key 
4. get [Sber GIgaChat API key](https://developers.sber.ru/docs/ru/gigachat/quickstart/ind-using-api) and insert it in server\llm.js API.key 
5. install libs
```js
npm i
```
6. run server
```
cd server
node index.js
```


## Usage

1. Look at https://localhost
2. Press button with microphone before speaking and another press after you stop speaking
3. Wait a little and listen AI answer
4. Press 'clear' button when you get bored and forget it

<img alt="example" src="https://raw.githubusercontent.com/artemdudkin/tts-and-ai-chat/ae12d705bf216deec8d3bd6f43da7d836ad1368c/docs/localhost.png" height="250"/>


## License

MIT
