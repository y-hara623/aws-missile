var DCDriver = require('dream-cheeky-driver');
var request = require('request');
var Promise = require('bluebird');
var awsIot = require('aws-iot-device-sdk');

var thingShadows = awsIot.thingShadow({
  keyPath: './cert/3cf1d99443-private.pem.key',
  certPath: './cert/3cf1d99443-certificate.pem.crt',
  caPath: './cert/rootCA.pem',
  clientId: 'cheekyMissile',
  region: 'ap-northeast-1'
});

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
thingShadows.on('connect', function() {
  thingShadows.register('cheekyMissile');
  setTimeout(function() {
    clientTokenGet = thingShadows.get('iot_test');
  }, 2000);
  console.log('connected');
});

thingShadows.on('delta',
  function(thingName, stateObject) {
    console.log('received delta on ' + thingName + ': ' +
      JSON.stringify(stateObject));

        recs = stateObject.state.value;
        recs.reduce(function(promise, rec) {
          return promise.then(function(value) {
            return new Promise(function(onFulfilled, onRejected) {

              //ミサイルを動かす
              var inst = rec.value.instruction.value;
              var param = Number(rec.value.param.value);
              switch (inst) {
                case 'fire':
                  DCDriver.fire(param, function() {
                    var msg = 'missile';
                    if (param != 1) msg += 's';
                    console.log('fired ' + param + ' ' + msg + '!')
                    onFulfilled(rec);
                  });
                  break;
                case 'moveUp':
                  DCDriver.moveUp(param, function() {
                    console.log('moved to up for ' + param + ' ms');
                    onFulfilled(rec);
                  });
                  break;
                case 'moveDown':
                  DCDriver.moveDown(param, function() {
                    console.log('moved to down for ' + param + ' ms');
                    onFulfilled(rec);
                  });
                  break;
                case 'moveRight':
                  DCDriver.moveRight(param, function() {
                    console.log('moved to right for ' + param + ' ms');
                    onFulfilled(rec);
                  });
                  break;
                case 'moveLeft':
                  DCDriver.moveLeft(param, function() {
                    console.log('moved to left for ' + param + ' ms');
                    onFulfilled(rec);
                  });
                  break;
                case 'park':
                  DCDriver.park(function() {
                    console.log('parked');
                    onFulfilled(rec);
                  });
                  break;
              }
            });
          });
        }, Promise.resolve()).then(function(value) {
          console.log('Finish');
        });

        return;
  });
