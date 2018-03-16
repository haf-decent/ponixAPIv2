var credentials = require('../../config/admin.js');

module.exports = function(req) {
    if (!req.headers.authorization) return -1;
        
    var encoded = req.headers.authorization.split(' ')[1];
    var decoded = new Buffer(encoded, 'base64').toString('utf8');
    var cred = decoded.split(':');
    if (cred[0] == credentials.username && cred[1] == credentials.password) return 1;
    else return 0;
}