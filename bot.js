var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/cool guy$/;

  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage() {
  var botResponse, options, body, botReq;

  botResponse = cool();

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function roll (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
module.exports = function (req, res, next) {
  // default roll is 2d6
  var matches;
  var times = 2;
  var die = 6;
  var rolls = [];
  var total = 0;
  var botPayload = {};
  
  if (req.body.text) {
    // parse roll type if specified
    matches = req.body.text.match(/^(\d{1,2})d(\d{1,2})$/);

    if (matches && matches[1] && matches[2]) {
      times = matches[1];
      die = matches[2];
    } else {
      // send error message back to user if input is bad
      return res.status(200).send('<number>d<sides>');
    }
  } 
}
// roll dice and sum
for (var i = 0; i < times; i++) {
  var currentRoll = roll(1, die);
  rolls.push(currentRoll);
  total += currentRoll;
}

// write response message and add to payload
botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ':\n' +
                          rolls.join(' + ') + ' = *' + total + '*';

exports.respond = respond;
