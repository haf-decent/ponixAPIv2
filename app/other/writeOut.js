var fs = require('fs');

module.exports = function writeOut(obj) {
    var path = __dirname + '/../../config/lists.json';
    fs.writeFile(path, JSON.stringify(obj, null, 4), function(err) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
};