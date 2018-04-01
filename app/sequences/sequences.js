const Relay = require('sainsmart-16-hid');
var rpio = require('rpio');
var list = require('../../config/lists.json');
var writeOut = require('../other/writeOut.js');

let relay = new Relay();

module.exports = {
    initialize: function() {
        rpio.init({
            mapping: 'physical',
            gpiomem: true
        });
        for (var p in list.power) rpio.open(list.power[p].pin, rpio.INPUT);
        
        for (var bot in list.bots) {
            let b = list.bots[bot];
            if (b.state == "1") relay.set(b.relay - 1, true);
        }
        
        for (var p in list.power) rpio.mode(list.power[p].pin, rpio.OUTPUT);
        //writeOut(list);
        return list;
    },
    lights: function() {
        
    },
    shutdown: function() {
        relay.write(0b0000000000000000);
        for (var bot in list.bots) list.bots[bot]["state"] = "0";
        writeOut(list);
        return list;
    }
}