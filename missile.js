var DCDriver = require('dream-cheeky-driver');
var request = require('request');
var promise = require('bluebird');

recid = 1; //取得するレコード
request({
  method: 'GET',
  url: 'https://9rvef.cybozu.com/k/v1/records.json',
  headers: {
    'X-Cybozu-API-Token': 'S4QhQ1adupcaMT6bbLowaWQGfy5yGzmmbK06A3Eh',
    'Content-Type': 'application/json'
  },
  json: {
    app: 70,
    query: "$id=" + recid
  }
}, function(err, response, body) {


  var res = body;

  recs = res.records[0].inst_table.value;
  //promiseをreduceで動的にチェインする
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
