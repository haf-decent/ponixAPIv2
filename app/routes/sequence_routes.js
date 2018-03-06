var seqs = require('../../config/lists.json').sequences;
var sequences = require('../sequences/sequences.js');

module.exports = function(app, db) {
    
    //GET request for querying available sequences/required parameters
    app.get('/sequences/', (req, res) => {
        res.status(200).send(seqs);
    });
    app.get('/sequences/:name', (req, res) => {
        const seq = req.params.name;
        if (!(seq in seqs)) return res.status(404).send({'error': 'Invalid sequence: ' + seq + '\nValid sequences: ' + seqs});
        res.status(200).send('Required parameters for ' + seq + ' sequence: ' + seqs[seq]);
    });
    
    //POST request for calling sequences
    app.post('/sequences/:name', (req, res) => {
        var seq = req.params.name;
        if (!(seq in seqs)) return res.status(404).send({'error': 'Invalid sequence: ' + seq + '\nValid sequences: ' + seqs});
        var details = {};
        for (var p in seqs[seq]) {
            if (!(req.body[p])) return res.status(404).send({'error': 'Missing parameter: ' + p});
            details[p] = req.body[p];
        }
        // call function to initiate sequence
        try {
            var ret = sequences[seq]();
            res.status(200).send(ret);
        }
        catch (err) {
            res.status(200).send('Error occured while running sequence, ' + seq + ': ' + err)
        };
    });
    
    //DELETE request for removing sequences (almost definitely do not want this functionality available) (stop current sequence instead?)
    app.delete('/sequences/:name', (req, res) => {
        res.status(503).send({'error': 'You are not authorized to perform this action'});
        //db.collection('bots').remove();
    });
}