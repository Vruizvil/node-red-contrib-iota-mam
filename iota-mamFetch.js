const IOTA = require('iota.lib.js');
const MAM = require('./mam.client.js');

module.exports = function(RED) {
    function iotamamFetch(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        console.log("MAM fetch on iota node: " + config.iotaNode);
        console.log("MAM root: " + config.root);
        console.log("Fetching data ... ");
        const iota = new IOTA({ provider: config.iotaNode })

        let mamRoot = config.root;
        let mamState = MAM.init(iota)
        this.status({fill:"red",shape:"ring",text:"connecting"});
        let resp = MAM.fetch(mamRoot, 'public', null);

        resp.then(function(result) {
          console.log("Datasets found");
          console.log("###############################################");
          var json = {payload:"START ROOT = " + mamRoot};
          node.send(json);
          result.messages.forEach(function(result) {
            // console.log(iota.utils.fromTrytes(result));
            console.log(JSON.parse(iota.utils.fromTrytes(result)));
          });
          console.log("###############################################");
        });
        this.status({});
    }
    RED.nodes.registerType("iotamamFetch",iotamamFetch);
}
