var express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    pdfRoute = require('./pdfRoute');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-id, x-accounting-id");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (req.method === 'OPTIONS') {
        res.end();
    } else
        next();
});


app.use('/api/generatepdf', pdfRoute);

app.use('/', function (req, res) {
    res.send('Welcome to Death Race....2!');
});

var port = process.env.PORT || 9080;

app.listen(port, function () {
    console.log('Express is listening on port: ' + port);
});