// Import Packages
const express  = require('express');
const line     = require('@line/bot-sdk');
const request  = require('request');
const portNum  = process.env.PORT || 3000;

// Import self-made module
const smallTalk       = require('./modules/smallTalk');
const glitchCharArray = require('./modules/glitchChar');

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


// Hold user id and glitch level(increases as users talks with bot)
// The higher the userGlitchLevel, the buggier the text becomes
var userGlitchLevel = {};


// LINE BOT LOGIC
function handleEvent(event){
  const userId = event.source.userId;
  addGlitchLevel(userId);

  if(event.message.type === 'text'){
    const userText = event.message.text;

    smallTalk(userText)
      .then((smallTalkResponse) => {
        return client.replyMessage(event.replyToken, replyText(userId, smallTalkResponse));
      })
      .catch((err) => {
        console.error(err);
        return client.replyMessage(event.replyToken, replyText(userId, '...'));
      });

  } else {
    return Promise.resolve(null);
  }

}

// General function to return text object
function replyText(userId, text){
  const returnText = glitchifyText(userId, text);
  return {type: 'text', text: returnText};
}

// Set user's glitch Level(add to userId key if not yet defined)
// 25% chance for glitch level to increase
function addGlitchLevel(userId){
  if(Math.random() <= 0.25){
    if(userGlitchLevel[userId]){
      userGlitchLevel[userId]++;
    }else{
      userGlitchLevel[userId] = 1;
    }
  }
}

// Get user's glitch level(0 if not yet defined)
function getGlitchLevel(userId){
  return userGlitchLevel[userId] || 0;
}


// Glitch bot response based on user's glitch Level
function glitchifyText(userId, text){
  let returnTextArray = text.split('');

  // Replace glitchLevel amount of random character's with random glitchChar from glitchCharArray
  for(let count = 0; count < getGlitchLevel(userId); count++){
    const glitchChar = glitchCharArray[Math.floor(Math.random() * glitchCharArray.length)];
    returnTextArray[Math.floor(Math.random() * returnTextArray.length)] = glitchChar;
  }

  return returnTextArray.join('');
}
