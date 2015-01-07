var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.resolve(__dirname + '/../public')));
app.use(express.static(path.resolve(__dirname + '/../public/lib')));

app.get('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    var homepage = path.resolve(__dirname + '/../public/index.html');
    res.sendFile(homepage);
});

app.listen(8080);
