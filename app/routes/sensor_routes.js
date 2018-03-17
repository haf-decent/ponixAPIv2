var list = require('../../config/lists.json');
var auth = require('../other/basicAuth.js');

module.exports = function(app, db) {
    
    //GET requests for querying the values of sensors
    app.get('/sensors/', (req, res) => {
        res.status(200).send({data: list.sensors});
    });
    
    app.get('/sensors/:sensor', (req, res) => {
        var sensor = req.params.sensor;
        if (!list.sensors[sensor]) return res.status(404).send({error: 'Invalid sensor: ' + sensor});
        res.status(200).send({data: list.sensors[sensor].value});
    });
    
    //POST requests for adding sensors (perhaps allow for admin)
    app.post('/sensors/:sensor', (req, res) => {
        var check = auth(req);
        if (check === -1) return res.status(401).send({error: 'No Authorization provided'});
        else if (check === 0) return res.status(401).send({error: 'Invalid credentials'});
        else if (check === 1) {
            var sensor = req.params.sensor || null;
            if (!sensor) res.status(404).send({error: 'No sensor designated'});
            list.sensors[sensor] = {"value": "--"};
            if (db) db.collection('sensors').insert({
                sensor: sensor, 
                value: "--"
            }, (err, result) => {
                if (err) return res.status(503).send({error: 'Database error: ' + err + '\nPlease retry your request'});
                return res.status(200).send({data: 'Success - ' + sensor + ' added'});
            });
            else {
                writeOut(list);
                return res.status(200).send({
                    warning: 'Database not connected',
                    data: 'Success - ' + sensor + ' added'
                });
            }
            writeOut(list);
        }
        else return res.status(500).send({error: 'An unkown error occured'});
    });
    
    //DELETE requests for deleting sensors (perhaps allow for admin)
    app.delete('/sensors/:sensor', (req, res) => {
        var check = auth(req);
        if (check === -1) return res.status(401).send({error: 'No Authorization provided'});
        else if (check === 0) return res.status(401).send({error: 'Invalid credentials'});
        else if (check === 1) {
            var sensor = req.params.sensor || null;
            if (!sensor) res.status(404).send({error: 'No sensor designated'});
            delete list.sensors[sensor];
            writeOut(list);
            return res.status(200).send({
                warning: sensor + ' not deleted from database',
                data: 'Success - ' + sensor + ' deleted'
            });
        }
        else return res.status(500).send({error: 'An unkown error occurred'});
    });
    
    //PUT requests for updating sensor values (maybe force pi to take new value?)
    app.put('/sensors/:sensor/:value', (req, res) => {
        res.status(403).send({error: 'Permission Denied'});
    });
}