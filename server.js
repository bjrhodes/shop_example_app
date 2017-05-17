var http = require("http");
var fs = require("fs");
var express = require("express");
var app = express();

app.use(function (req, res, next) {
    console.log("The resource " + req.url + " was requested.");
    next();
});

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
console.log("Listening on http://127.0.0.1:8080");
server.listen('8080', '127.0.0.1');
