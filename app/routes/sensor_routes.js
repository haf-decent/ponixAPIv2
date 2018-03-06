var sensors = require('../../config/lists.json').sensors;
//var gpio = require('pi-gpio');

module.exports = function(app, db) {
    
    app.get('/sensors/:sensor', (req, res) => {
        const sensor = req.params.sensor;
        const target = {'sensor': sensor};
    });
}