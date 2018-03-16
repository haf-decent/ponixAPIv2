var list = require('../../config/lists.json');
var rpio = require('rpio');
var writeOut = require('../other/writeOut.js');
var auth = require('../other/basicAuth.js');

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
    
    //POST request for adding new bot designations (only allow for admin)
    app.post('/bots/:bot', (req, res) => {
        var check = auth(req);
        if (check == -1) return res.status(401).send({error: 'No Authorization provided'});
        
        else if (check == 0) return res.status(401).send({error: 'Invalid credentials'});
        else if (check == 1) {
            var bot = req.params.bot || null,
                pin = req.body.pin || null,
                state = req.body.state || null;
            if (!bot) return res.status(404).send({error: 'No bot designated'});
            if (state !== "0" && state !== "1") {
                return res.status(404).send({error: 'Invalid state: ' + state});
            }
            if (pin > 40 || pin < 3) {
                return res.status(404).send({error: 'Invalid pin: ' + pin});
            }
            for (var b in list.bots) {
                if (pin == list.bots[b].pin && bot !== b) {
                    return res.status(404).send({error: 'Pin ' + pin + ' is already assigned'});
                }
            }
            //add bot to database
            list.bots[bot] = {
                pin: pin,
                state: state
            };
            if (db) db.collection('bots').insert({
                bot: bot, 
                state: state
            }, (err, result) => {
                if (err) return res.status(503).send({error: 'Database error: ' + err + '\nPlease retry your request'});
                return res.status(200).send({data: 'Success - ' + bot + ' added'});
            });
            else {
                writeOut(list);
                return res.status(200).send({
                    warning: 'Database not connected',
                    data: 'Success - ' + info.bot + ' added'
                });
            }
            writeOut(list);
        }
        else return res.status(500).send({error: 'An unknown error occurred'});
    });
    
    //DELETE request for removing bots (only allow for admin)
    app.delete('/bots/:bot', (req, res) => {
        var check = auth(req);
        if (check == -1) return res.status(401).send({error: 'No Authorization provided'});
        else if (check == 0) return res.status(401).send({error: 'Invalid credentials'});
        else if (check == 1) {
            var bot = req.params.bot;
            if (!list.bots[bot]) return res.status(404).send({error: 'Invalid bot designation: ' + bot});
            //delete bot from database
            return res.status(200).send({data: 'Success - ' + bot + ' removed'});
        }
        else return res.status(500).send({error: 'An unknown error occurred'});
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
        
        rpio.mode(parseInt(list.bots[bot]["pin"]), (s == "1") ? rpio.OUTPUT: rpio.INPUT);
        list.bots[bot]["state"] = s;
        writeOut(list);
        if (db) db.collection('bots').update({bot: bot}, {$set: {state: s}}, (err, result) => {
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