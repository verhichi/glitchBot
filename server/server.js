// Import Packages
const express  = require('express');
const line     = require('@line/bot-sdk');
const request  = require('request');
const portNum  = process.env.PORT || 3000;

// Start up express server
const app = express();
app.listen(portNum, () => {
  console.log('Server is up and running!');
});


// API key for the LINE BOT, issue a new one on production and set the values to be environment variables
const lineConfig = {
  channelSecret: 'fab1ae7d4fedc67c17dcd23b54b6ee59',
  channelAccessToken: 'GEtiNseegEXhR4vyA7mHon1G9eloQadCLzU4T9abT2c0BF8FZfUqLgE6PbCM1U+onJdWcYfSK/+x91sNCsfwCiQYnmXiWZHZu9f99kWVXECbXhkjqQVQeCj/gDzgvVtYwuwo4SLdWOPFo1yMpgrLLAdB04t89/1O/w1cDnyilFU='
};
const client = new line.Client(lineConfig);


// Routing for the linebot webhook
app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});


// LINE BOT LOGIC
function handleEvent(event){

  if(event.message.type === 'text'){
    const userText = event.message.text;

    docomoChat(userText)
      .then((docomoResponse) => {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: docomoResponse
        });
      })
      .catch((err) => {
        console.error(err);

        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '...'
        });
      });

  } else {
    return Promise.resolve(null);
  }

}



// API key and URL for docomo conversation API, issue a new one on production and set the values to be environment variables
const docomoApiKey = '4277744164576c47386f6d552e6e6e6c7037313463755647635577777130666f5176743547685546416f34';
const docomoRequestUrl = `https://api.apigw.smt.docomo.ne.jp/naturalChatting/v1/dialogue?APIKEY=${docomoApiKey}`;
const docomoAppId = '309ad727-cf3f-4270-bf07-076ce82228e7';

function docomoChat(userText){
  const docomoRequestOption = {
    url: docomoRequestUrl,
    headers: {'Content-Type': 'application/json;charset=UTF-8'},
    body: JSON.stringify({
      language: 'ja-JP',
      botId: 'Chatting',
      appId: docomoAppId,
      voiceText: userText
    })
  };

  return new Promise((resolve, reject) => {
    request.post(docomoRequestOption, function(err, res, body){
      if(err) reject(err);

      const bodyObj = JSON.parse(body);
      resolve(bodyObj.systemText.expression);
    });
  });


}
