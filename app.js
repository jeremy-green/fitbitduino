'use strict';

var OAuth = require('oauth'),
    five = require('johnny-five'),
    date = new Date(),
    errorPin = 8,
    pin2, pin3, pin4, pin5, pin6,
    board, oauth;

// sudo chmod 777 /dev/ttyACM0
board = new five.Board();

oauth = new OAuth.OAuth(
  'http://api.fitbit.com/oauth/request_token',
  'http://api.fitbit.com/oauth/access_token',
  '<CONSUMER_KEY>',
  '<CONSUMER_SECRET>',
  '1.0',
  null,
  'HMAC-SHA1'
);

board.on('ready', function() {
  pin2 = new five.Led(2);
  pin3 = new five.Led(3);
  pin4 = new five.Led(4);
  pin5 = new five.Led(5);
  pin6 = new five.Led(6);

  handleCall();
  setInterval(function() {
    handleCall();
  }, 30000);
});

function handleCall() {
  oauth.get(
    'http://api.fitbit.com/1/user/<USER_ID>/activities/date/' + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '.json',
    '<USER_TOKEN>', //user token
    '<USER_SECRET>', //user secret
    function (e, data, res) {
      data = JSON.parse(data);
      if (e) {
        //turns lights off and turn on a red one
        handleError(e);
        return;
      }

      if (data.summary.steps !== undefined) {
        var steps = data.summary.steps,
            strobe = 500;

        console.log('STEPS: ', steps);

        pinsOff();

        if (steps <= 2000) {
          pin2.strobe(strobe);
        } else if (steps > 2000 && steps <= 4000) {
          pin2.on();
          pin3.strobe(strobe);
        } else if (steps > 4000 && steps <= 6000) {
          pin2.on();
          pin3.on();
          pin4.strobe(strobe);
        } else if (steps > 6000 && steps <= 8000) {
          pin2.on();
          pin3.on();
          pin4.on();
          pin5.strobe(strobe);
        } else if (steps > 8000 && steps <= 10000) {
          pin2.on();
          pin3.on();
          pin4.on();
          pin5.on();
          pin6.strobe(strobe);
        } else {
          pin2.on();
          pin3.on();
          pin4.on();
          pin5.on();
          pin6.on();
        }
      }
    }
  );
}

function pinsOff() {
  pin2.off();
  pin3.off();
  pin4.off();
  pin5.off();
  pin6.off();
}

function handleError(e) {
  console.log(e);
  pinsOff();
  var errorLED = new five.Led(errorPin);
  errorLED.on();
  board.repl.inject({
    error: errorLED
  });
}