function uintToInt(uint, nbit) {
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
    uint <<= 32 - nbit;
    uint >>= 32 - nbit;
    return uint;
}

var translations = {
    "0": "000000",
    "1": "000001",
    "2": "000010",
    "3": "000011",
    "4": "000100",
    "5": "000101",
    "6": "000110",
    "7": "000111",
    "8": "001000",
    "9": "001001",
    ":": "001010",
    ";": "001011",
    "<": "001100",
    "=": "001101",
    ">": "001110",
    "?": "001111",
    "@": "010000",
    "A": "010001",
    "B": "010010",
    "C": "010011",
    "D": "010100",
    "E": "010101",
    "F": "010110",
    "G": "010111",
    "H": "011000",
    "I": "011001",
    "J": "011010",
    "K": "011011",
    "L": "011100",
    "M": "011101",
    "N": "011110",
    "O": "011111",
    "P": "100000",
    "Q": "100001",
    "R": "100010",
    "S": "100011",
    "T": "100100",
    "U": "100101",
    "V": "100110",
    "W": "100111",
    "`": "101000",
    "a": "101001",
    "b": "101010",
    "c": "101011",
    "d": "101100",
    "e": "101101",
    "f": "101110",
    "g": "101111",
    "h": "110000",
    "i": "110001",
    "j": "110010",
    "k": "110011",
    "l": "110100",
    "m": "110101",
    "n": "110110",
    "o": "110111",
    "p": "111000",
    "q": "111001",
    "r": "111010",
    "s": "111011",
    "t": "111100",
    "u": "111101",
    "v": "111110",
    "w": "111111"
};
var navigationStatuses = [
    'Under way using engine',
    'At anchor',
    'Not under command',
    'Restricted manoeuverability',
    'Constrained by her draught',
    'Moored',
    'Aground',
    'Engaged in Fishing',
    'Under way sailing',
    'Reserved for future amendment of Navigational Status for HSC',
    'Reserved for future amendment of Navigational Status for WIG',
    'Reserved for future use',
    'Reserved for future use',
    'Reserved for future use',
    'AIS-SART is active',
    'Not defined (default)'
];

var char2bits = function (c) {
    return translations[c];
}
function padLeft(nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || '0') + nr;
}

function AISMessage(content) {
    var self = this;
    self.struct = {};
    try {
        self.parts = content.split(',');
        self.binarr = '';
        self.payload = self.parts[5];
        //convert payload to 'binary' string
        for (var i in self.payload)
            self.binarr += char2bits(self.payload[i]);

        //extract properties: http://catb.org/gpsd/AIVDM.html#_types_1_2_and_3_position_report_class_a    
        //MMSI 8-37
        var relevantpart = self.binarr.substring(8, 38);
        self.struct.mmsi = parseInt(relevantpart, 2);
        //navstatus, 38-41, lookup
        relevantpart = self.binarr.substring(38, 42);
        self.struct.navigationStatus = navigationStatuses[parseInt(relevantpart, 2)];
        //Rate of Turn, 42-49
        relevantpart = self.binarr.substring(42, 50);
        self.struct.rateOfTurn = (parseInt(relevantpart, 2));
        //Speed over ground, 50-59
        relevantpart = self.binarr.substring(50, 60);
        self.struct.speedOverGround = (parseInt(relevantpart, 2)) / 10;
        //Longitude, 61-88
        relevantpart = self.binarr.substring(61, 89);
        self.struct.longitude = uintToInt((parseInt(relevantpart, 2)),28) / 600000.0;
        //Latitude, 89-115
        relevantpart = self.binarr.substring(89, 116);
        self.struct.latitude = uintToInt((parseInt(relevantpart, 2)),27) / 600000.0;
        //Course over Ground, 116-127
        relevantpart = self.binarr.substring(116, 128);
        self.struct.courseOverGround = (parseInt(relevantpart, 2)) / 10;
        //True Heading, 128-136
        relevantpart = self.binarr.substring(128, 137);
        self.struct.trueHeading = (parseInt(relevantpart, 2));
        //Time Stamp, 137-142
        relevantpart = self.binarr.substring(137, 143);
        self.struct.timeStampSeconds = (parseInt(relevantpart, 2));
        self.struct.date = Date.now();
        var now = new Date();
        self.struct.isoDate = now.getUTCFullYear().toString() + "-" +
            padLeft((now.getUTCMonth() + 1).toString(), 2, '0') + "-" +
            padLeft(now.getUTCDate().toString(), 2, '0') + " " +
            padLeft(now.getUTCHours().toString(), 2, '0') + ":" +
            padLeft(now.getUTCMinutes().toString(), 2, '0') + ":" +
            padLeft(now.getUTCSeconds().toString(), 2, '0');
        self.struct.source = content;
        self.status = "OK";
        self.exception = {};
    } catch (e) {
        self.status = "ERROR";
        self.exception = e;
    }
}


module.exports = function (RED) {
    function AISNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg) {
            var aismessage = new AISMessage(msg.payload);

            msg.payload = aismessage.struct;
            msg.exception = aismessage.exception;
            node.send(msg);

        });
    }
    RED.nodes.registerType("ais", AISNode);
}