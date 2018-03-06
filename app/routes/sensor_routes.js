var sensors = require('../../config/lists.json').sensors;
//var gpio = require('pi-gpio');

module.exports = function(app, db) {
    
    app.get('/sensors/:sensor', (req, res) => {
        const sensor = req.params.sensor;
        if (!sensors[sensor]) return res.status(404).send("Invalid sensor: " + sensor);
        res.status(200).send(sensors[sensor].value);
    });
}