var rpio = require('rpio');
var list = require('../../config/lists.json');
var fs = require('fs');
var sleep = require('co-sleep');

function writeOut(obj) {
    var path = __dirname + '/../../config/lists.json';
    fs.writeFile(path, JSON.stringify(obj, null, 4), function(err) {
            if (err) console.log(err);
        });
}

module.exports = {
    initialize: function() {
        rpio.init({
            mapping: 'physical',
            gpiomem: true
        });
        for (var bot in list.bots) {
            if (bot.indexOf("peri") > -1) list.bots[bot]["state"] = "0";
            var mode = (list.bots[bot]["state"] == "0") ? rpio.INPUT: rpio.OUTPUT;
            rpio.open(list.bots[bot]["pin"], mode);
        }
        writeOut(list);
        return list;
    },
    drain: function() {
        rpio.mode(list.bots.pump_1.pin, rpio.INPUT);
        list.bots.pump_1.state = "0";
        rpio.mode(list.bots.pump_2.pin, rpio.INPUT);
        list.bots.pump_2.state = "0";
        rpio.mode(list.bots.valve_1.pin, rpio.OUTPUT);
        list.bots.valve_1.state = "1";
        rpio.mode(list.bots.valve_2.pin, rpio.OUTPUT);
        list.bots.valve_2.state = "1";
        
        rpio.mode(list.bots.valve_3.pin, rpio.OUTPUT);
        rpio.mode(list.bots.valve_4.pin, rpio.OUTPUT);
        sleep(2000);
        rpio.mode(list.bots.valve_3.pin, rpio.INPUT);
        rpio.mode(list.bots.valve_4.pin, rpio.INPUT);
        
        writeOut(list);
        return list;
    },
    dose: function() {
        rpio.mode(list.bots.pump_3.pin, rpio.OUTPUT);
        list.bots.pump_3.state = "1";
        rpio.mode(list.bots.pump_4.pin, rpio.OUTPUT);
        list.bots.pump_4.state = "1";
        rpio.mode(list.bots.peri_1.pin, rpio.OUTPUT);
        list.bots.peri_1.state = "1";
        rpio.mode(list.bots.peri_2.pin, rpio.OUTPUT);
        list.bots.peri_2.state = "1";
        writeOut(list);
        return list;
    },
    shutdown: function() {
        for (var bot in list.bots) {
            rpio.mode(list.bots[bot]["pin"], rpio.INPUT);
            list.bots[bot]["state"] = "0";
        }
        writeOut(list);
        return list;
    }
}