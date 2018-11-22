// This file consists the code for using the smallTalk API of Recruit Co.

// Import package
const request = require('request');

// API key and URL for smallTalk conversation API, issue a new one on production and set the values to be environment variables
const smallTalkApiKey = 'DZZz7RAMAvyluBTnmwzJX3SVPzuTlVK5';
const smallTalkRequestUrl = 'https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk';

module.exports = function(userText){
  const smallTalkRequestOption = {
    url: smallTalkRequestUrl,
    form: {
      apikey: smallTalkApiKey,
      query: userText
    }
  };

  return new Promise((resolve, reject) => {
    request.post(smallTalkRequestOption, function(err, res, body){
      if(err){
        reject(err);
      }

      console.log(body);
      const bodyObj = JSON.parse(body);

      if(bodyObj.results[0].reply){
        resolve(bodyObj.results[0].reply);
      } else {
        reject('Invalid response from smallTalk');
      }
    });
  });
};
