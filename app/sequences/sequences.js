const Relay = require('sainsmart-16-hid');
var rpio = require('rpio');
var list = require('../../config/lists.json');
var writeOut = require('../other/writeOut.js');

let relay = new Relay();
//let relay = null;

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
    lights: function(pars) {
        if (!pars || !pars.state) throw new error("No state provided");
        else if (!(pars.state == "1" || pars.state == "0")) throw new error("Invalid state: " + pars.state);
        else {
            var s = (pars.state == "1") ? true: false;
            for (var bot in list.bots) {
                relay.set(list.bots[bot].relay - 1, s);
                list.bots[bot].state = pars.state;
            }
            writeOut(list);
            return list;
        }
    },
    shutdown: function() {
        relay.write(0b0000000000000000);
        for (var bot in list.bots) list.bots[bot].state = "0";
        writeOut(list);
        return list;
    },
    relay: relay
}