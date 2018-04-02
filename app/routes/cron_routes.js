var auth = require('../other/basicAuth.js');
var jobs = require('../../config/jobs.js');
var schedule = require('../../config/schedule.json');
var writeOut = require('../other/writeOut.js');

module.exports = function(app, db) {
    
    //GET requests for querying current cronjobs
    app.get('/cron/', (req, res) => {
        res.status(200).send({data: schedule});
    });
    
    //POST request for creating new cronjobs
    app.post('/cron/', (req, res) => {
        res.status(403).send({error: "Permission denied"});
    });
    
    //DELETE request for deleting cronjobs
    app.delete('/cron/', (req, res) => {
        res.status(403).send({error: "Permission denied"});
    });
    
    //PUT request for changing cronjob execution time
    app.put('/cron/:name', (req, res) => {
        var check = auth(req);
        if (check == -1) return res.status(401).send({error: 'No Authorization provided'});
        
        else if (check == 0) return res.status(401).send({error: 'Invalid credentials'});
        else if (check == 1) {
            var job = req.params.name || null;
            var nTime = req.body.time || null;
            if (!jobs[job]) return res.status(404).send({error: 'Invalid job name: ' + job});
            var tArray = nTime.split(' ');
            var valid = true;
            if (tArray.length !== 6) valid = false;
            else if (tArray[0] !== '*' && parseInt(tArray[0]) > 60) valid = false;
            else if (tArray[1] !== '*' && parseInt(tArray[1]) > 60) valid = false;
            else if (tArray[2] !== '*' && parseInt(tArray[2]) > 24) valid = false;
            else if (tArray[3] !== '*' && parseInt(tArray[3]) > 32) valid = false;
            else if (tArray[4] !== '*' && parseInt(tArray[4]) > 12) valid = false;
            else if (tArray[5] !== '*' && parseInt(tArray[5]) > 7) valid = false;
            if (!valid) {
                return res.status(404).send({
                    error: 'Invalid time format: ' + nTime + ' (valid format: 0-59 0-59 0-23 1-31 0-11 0-6, or * )'
                });
            }
            else {
                schedule[job] = nTime;
                writeOut(schedule);
                return res.status(200).send({data: 'Success - Reboot required'});
            }
        }
        else return res.status(500).send({error: 'An unknown error occurred'});
    });
}