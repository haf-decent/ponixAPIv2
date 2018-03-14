var list = require('../../config/lists.json');
var rpio = require('rpio');
var writeOut = require('../other/writeOut.js');

module.exports = function(app, db) {
    
    //GET request for querying the states of bots
    app.get('/bots/', (req, res) => {
        res.status(200).send({data: list.bots}); //return full botslist (from local database)
    });
    
    app.get('/bots/:bot', (req, res) => {
        var bot = req.params.bot;
        if (!list.bots[bot]) {
            console.log('Invalid bot: ' + bot);
            return res.status(404).send({error: 'Invalid bot designation: ' + bot});
        }
        
        res.status(200).send({data: list.bots[bot]}); //return requested bot info (from local database)
    });
    
    //POST request for adding new bot designations (perhaps allow for admin)
    app.post('/bots', (req, res) => {
        return res.status(403).send({error: 'Permission Denied'});
    });
    
    //DELETE request for removing bots (perhaps allow for admin)
    app.delete('/bots/:bot', (req, res) => {
        return res.status(403).send({error: 'Permission Denied'});
    });
    
    //PUT request for updating the state of a bot
    app.put('/bots/:bot/:state', (req, res) => {
        const bot = req.params.bot;
        const s = req.params.state;
        
        if (s !== '0' && s !== '1') {
            console.log('Invalid state: ' + s);
            return res.status(404).send({error: 'Invalid state designation: ' + s}); 
        }
        else if (!list.bots[bot]) {
            console.log('Invalid bot: ' + bot);
            return res.status(404).send({error: 'Invalid bot designation: ' + bot});
        }
        
        rpio.mode(list.bots[bot]["pin"], (s == "1") ? rpio.OUTPUT: rpio.INPUT); //update physical state
        list.bots[bot]["state"] = s;
        writeOut(list); //update local database state
        
        if (db) db.collection('bots').update({bot: bot}, {$set: {state: s}}, function(err, result) {
            if (err) {
                console.log(err);
                return res.status(200).send({
                    warning: 'Database error: ' + err,
                    data: 'Success - ' + bot + ': ' + s
                });
            }
            else if (result.result.n == 0) return res.status(200).send({
                warning: 'Bot is not initiated in database: ' + bot,
                data: 'Success - ' + bot + ': ' + s
            });
            else return res.status(200).send({data: 'Success -' + bot + ': ' + s});
        });
        else res.status(200).send({
            warning: 'Database not connected',
            data: 'Success - ' + bot + ': ' + s
        }); //send confirmation
    });
}