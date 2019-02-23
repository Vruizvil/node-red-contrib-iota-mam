const IOTA = require('iota.lib.js');
const MAM = require('./mam.client.js/lib/mam.client.js');
const TRAN = require('transliteration');

function mamSeedGen() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

  for (var i = 0; i < 81; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  console.log('New Channel with following SEED generated: ' + text);
  return text;
}

module.exports = function(RED) {
    function iotamamPublish(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node._sec = 2;
        node._firstroot = '';
        console.log("MAM publish INIT on iota node: " + config.iotaNode);
        const iota = new IOTA({ provider: config.iotaNode })
        node._state = MAM.init(iota, mamSeedGen(), 2, 0);
        node.readyMAM = true;

        node.on('input', function(msg) {
            if (this.readyMAM) {

              let txt = JSON.stringify(msg.payload);
              let ascii = TRAN.transliterate(txt);
              let trytes = iota.utils.toTrytes(ascii);

              let message = MAM.create(this._state, trytes);
              // Update the mam state so we can keep adding messages.
              this._state = message.state;

              console.log("Uploading dataset via MAM - please wait")
              console.log(message.address)
              this.status({fill:"red",shape:"ring",text:"connecting"});
              let resp = MAM.attach(message.payload, message.address);
              this.readyMAM = false;
              resp.then(function(result) {
                 console.log(result) //will log results.
                 this.status({});
                 node.readyMAM = true;
                 node.send({payload:message.address});
              });
            }
        });
    }
    RED.nodes.registerType("iotamamPublish",iotamamPublish);
}
