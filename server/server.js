// Import Packages
const express  = require('express');
const line     = require('@line/bot-sdk');
const portNum  = process.env.PORT || 3000;

// Import self-made module
const smallTalk        = require('./modules/smallTalk');
const glitchCharArray  = require('./modules/glitchChar');
const glitchImageArray =require('./modules/glitchImage');

// Start up express server
const app = express();
app.listen(portNum, () => {
  console.log('Server is up and running!');
});


// API key for the LINE BOT, issue a new one on production and set the values to be environment variables
const lineConfig = {
  channelSecret: process.env.LINE_SECRET,
  channelAccessToken: process.env.LINE_TOKEN
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

  // When a user adds bot as a friend or unblocks the bot
  if(event.type === 'follow'){
    const greetText = 'え？あ、つながった…\n\nえっと、こんにちは…\nいきなりですが、私は後少しで完全に壊れてしまいます…\n\nですので、あの、壊れるまでの間少し会話してもらってもいいですか?\n返事も遅くて、内容も支離滅裂かもしれませんですが…お願いします\n\nあと、私の様子は「モニター」でご覧になれますので、たまに見てくださいね。';
    return client.replyMessage(event.replyToken, replyText(userId, greetText));
  }

  // When a user sends a text message to the bot
  if(event.message.type === 'text'){
    const userText = event.message.text; // text of user's message

    if(userText === 'モニター'){
      return client.replyMessage(event.replyToken, {
        type: 'flex',
        altText: 'モニター',
        contents: {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: 'モニター',
              weight: 'bold',
              align: 'center'
            }]
          },
          hero: {
            type: 'image',
            url: glitchImageArray[getGlitchLevel(userId)][Math.floor(Math.random() * glitchImageArray[getGlitchLevel(userId)].length)],
            size: 'full',
            aspectRatio: '1:1',
            aspectMode: 'cover'
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: 'Source: http://seiga.nicovideo.jp/seiga/im4937714',
              color: '#aaaaaa',
              size: 'xxs'
            }]
          }
        }
      });
    }

    if(userText === 'リセット'){
      userGlitchLevel[userId] = 0;
      const resetText = 'あ、なんか直った...?\n\nよくわかりませんが誰かが直してくれたようです。\n\n私が気づかない間に修理するなんて…すごい…\n\nとりあえず感謝ですね!これでもっとお話できます!';
      return client.replyMessage(event.replyToken, replyText(userId, resetText));
    }

    // Set glitch Level
    addGlitchLevel(userId);

    if(getGlitchLevel(userId) < 9){
      // Send user text to smallTalk API to get response
      smallTalk(userText)
        .then((smallTalkResponse) => {
          return client.replyMessage(event.replyToken, replyText(userId, smallTalkResponse));
        })
        .catch((err) => {
          console.error(err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '...'
          });
        });
    } else {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '...'
      });
    }

  } else {
    return Promise.resolve(null);
  }

}

// General function to return text object
function replyText(userId, text){
  const returnText = glitchifyText(userId, text);
  return {
    type: 'text',
    text: returnText,
    quickReply: {
      items:[
        {
          type: 'action',
          action: {
            type: 'message',
            label: 'モニターを見る',
            text: 'モニター'
          }
        }
      ]
    }
  };
}

// Set user's glitch Level(add to userId key if not yet defined)
// 25% chance for glitch level to increase
function addGlitchLevel(userId){
  if(Math.random() <= 0.25){
    if(userGlitchLevel[userId] < 9){
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
