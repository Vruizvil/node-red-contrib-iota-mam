const IOTA = require('iota.lib.js');
const MAM = require('./mam.node.js');

function mamSeedGen() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

  for (var i = 0; i < 81; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  console.log('New Channel with following SEED generated: ' + text);
  return text;
}

module.exports = function(RED) {
    function mamPublish(config) {
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
              // upload sensorTag's temperature
              // let concatWithDate = JSON.stringify("Sensor Timestamp "+new Date()+" measured ambiant temperature "+msg.payload.json_data);
              // HERE you could change to upload whole msg.payload json object too
              // console.log(msg.payload.json_data)
              let concatWithDate = JSON.stringify("Sensor Timestamp "+new Date()+" measured ambiant temperature "+msg.payload.json_data.ambient);
              // HERE you could change to upload whole msg.payload json object too
              let trytes = iota.utils.toTrytes(concatWithDate)


              let message = MAM.create(this._state, trytes);
              // Update the mam state so we can keep adding messages.
              this._state = message.state;

              console.log("Uploading dataset via MAM - please wait")
              console.log(message.address)
              let resp = MAM.attach(message.payload, message.address);
              this.readyMAM = false;
              resp.then(function(result) {
                 // console.log(result) //will log results.
                 node.readyMAM = true;
                 node.send({payload:message.address});
              });
            }
        });
    }
    RED.nodes.registerType("mamPublish",mamPublish);
}
