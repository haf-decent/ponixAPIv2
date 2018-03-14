var sensors = require('../../config/lists.json').sensors;
//var gpio = require('pi-gpio');

module.exports = function(app, db) {
    
    //GET requests for querying the values of sensors
    app.get('/sensors/', (req, res) => {
        res.status(200).send({data: sensors});
    });
    
    app.get('/sensors/:sensor', (req, res) => {
        const sensor = req.params.sensor;
        if (!sensors[sensor]) return res.status(404).send({error: 'Invalid sensor: ' + sensor});
        res.status(200).send({data: sensors[sensor].value});
    });
    
    //POST requests for adding sensors (perhaps allow for admin)
    app.post('/sensors/:sensor', (req, res) => {
        res.status(403).send({error: 'Permission Denied'});
    });
    
    //DELETE requests for deleting sensors (perhaps allow for admin)
    app.delete('/sensors/:sensor', (req, res) => {
        res.status(403).send({error: 'Permission Denied'});
    });
    
    //PUT requests for updating sensor values (no reason to allow this for now)
    app.put('/sensors/:sensor/:value', (req, res) => {
        res.status(403).send({error: 'Permission Denied'});
    });
}