const express = require('express'); //web framework
const MongoClient = require('mongodb').MongoClient; //database
const bodyParser = require('body-parser'); //handling encoding
const db = require('./config/db'); //database configuration
const CronJob = require('cron').CronJob;
var jobs = require('./config/jobs');

const app = express();

const port = 3000; //Go to <localhost||IPAddress>:<port> to see app

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('views'));

//Connect to database. Upon connection, serve app to port and expose endpoints
MongoClient.connect(db.url, (err, database) => {
    if (err) {
        console.log(err);
        database = null;
    }
    
    app.engine('html', require('ejs').renderFile);
    
    require('./app/routes')(app, database);
    
    app.get('/', (req, res) => {
        res.render('index.html');
    });
    
    app.listen(port, () => {
      console.log('We are live on ' + port);
    });
    
    for (var j in jobs) {
        var job = new CronJob(jobs[j]);
        job.start();
    }
});



//running "npm run dev" in terminal allows app to auto update if files are changed
//see package.json file to see nodemon (labeled dev) designation
//For routes, http status codes are sent to the user of the API and translate as follows:
// - 200: OK, great everything is great
// - 401: Authentication is required, try harder next time
// - 403: Authentication is impossible, you will never get this
// - 404: URL (asset/command) not found, check your shit and try again, loser
// - 500: Some error occurred on the server that was not expected, too fucking bad
// - 503: Gateway Timeout, a third party service your API is using timed out, it's not your fault