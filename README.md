# node-red-node-ais
A simple node that reads an AIS encoded message from the incoming message's payload, transforms it into an objects and outputs that object into the payload of the outgoing message. 
It will only process standard position reports as described here: http://catb.org/gpsd/AIVDM.html#_types_1_2_and_3_position_report_class_a

Install via: npm i node-red-contrib-ais