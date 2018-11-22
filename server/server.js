// Import Packages
const express  = require('express');
const line     = require('@line/bot-sdk');
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

// API key for docomo conversation API, issue a new one on production and set the values to be environment variables
const docomoConfig = {
  id: '7Vx3sRJAwAcMaGNwQeriyQSZD3ASZPz7QQcfYEcJsF2P',
  secret: 'T\7fz_C.f:XyUR=L[]ZZ',
  key: '4277744164576c47386f6d552e6e6e6c7037313463755647635577777130666f5176743547685546416f34'
};


// Routing for the linebot webhook
app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});


// LINE BOT LOGIC
const client = new line.Client(lineConfig);

function handleEvent(event){
  console.log(event);

  if(event.message.type === 'text'){
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: event.message.text
    });
  } else {
    return Promise.resolve(null);
  }

}
