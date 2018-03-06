var list = require('../../config/lists.json');
var rpio = require('rpio');
var fs = require('fs');

module.exports = function(app, db) {
    
    //GET request for querying the states of bots
    app.get('/bots/', (req, res) => {
        res.status(200).send(list.bots);
    });
    app.get('/bots/:bot', (req, res) => {
        
    });
    
    //POST request for adding new bot designations (not sure if wanted...)
    app.post('/bots', (req, res) => {
        
    });
    
    //DELETE request for removing bots (almost definitely do not want this functionality available)
    app.delete('/bots/:bot', (req, res) => {
        
    });
    
    //PUT request for updating the state of a bot
    app.put('/bots/:bot/:state', (req, res) => {
        const bot = req.params.bot;
        const s = req.params.state;
        if (s !== '0' && s !== '1') {
            res.status(404).send({'error': 'Invalid state designation: ' + s}); 
            return console.log('Invalid state: ' + s);
        }
        else if (!list.bots[bot]) {
            res.status(404).send({'error': 'Invalid bot designation: ' + bot}); 
            return console.log('Invalid bot: ' + bot);
        }
        list.bots[bot]["state"] = s;
        rpio.mode(list.bots[bot]["pin"], (s == "1") ? rpio.OUTPUT: rpio.INPUT);
        fs.writeFile(__dirname + '/../../config/lists.json', JSON.stringify(list, null, 4), function(err) {
            if (err) console.log(err);
        });
        res.status(200).send("Success - " + bot + ": " + s);
    });
}