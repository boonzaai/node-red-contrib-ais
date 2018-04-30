module.exports = function (RED) {
    function AISNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg) {
            msg.payload = msg.payload.split(',')[5];
            node.send(msg);
        });
    }
    RED.nodes.registerType("ais", AISNode);
}