var seqs = require('../../config/lists.json').sequences;
var runSeq = require('../sequences/sequences.js');

module.exports = function(app, db) {
    
    //GET request for querying available sequences/required parameters
    app.get('/sequences/', (req, res) => {
        res.status(200).send({data: seqs});
    });
    
    app.get('/sequences/:name', (req, res) => {
        const seq = req.params.name;
        if (!(seq in seqs)) return res.status(404).send({error: 'Invalid sequence: ' + seq + '\nValid sequences: ' + seqs});
        res.status(200).send({data: 'Required parameters for ' + seq + ' sequence: ' + seqs[seq]});
    });
    
    //POST request for calling sequences
    app.post('/sequences/:name', (req, res) => {
        var seq = req.params.name;
        if (!(seq in seqs)) return res.status(404).send({error: 'Invalid sequence: ' + seq + '\nValid sequences: ' + seqs});
        var missing = [],
            pars = {};
        for (var par in seqs[seq]) {
            if (!req.body[par]) missing.push(par);
            else pars[par] = req.body[par];
        }
        if (seqs[seq].length > 0 && missing.length > 0) {
            return res.status(404).send({error: 'Missing parameter(s): ' + missing});
        }
        // call function to initiate sequence
        try {
            var ret = runSeq[seq](pars);
            res.status(200).send({data: ret});
        }
        catch (err) {
            res.status(200).send({error: 'Error occurred while running ' + seq + ' sequence: ' + err});
        }
    });
    
    //DELETE request for removing sequences (stop current sequence?)
    app.delete('/sequences/:name', (req, res) => {
        res.status(403).send({error: 'You are not authorized to perform this action'});
    });
}