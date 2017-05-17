var http = require("http");
var fs = require("fs");
var express = require("express");
var app = express();
var sqlite = require('sqlite');
var Mustache = require('mustache');

sqlite.open('./database.sqlite').then(function(db) {

    app.use(function (req, res, next) {
        console.log("The resource " + req.url + " was requested.");
        next();
    });

    app.use(express.static(__dirname + '/public'));

    var server = http.createServer(app);
    console.log("Listening on http://127.0.0.1:8080");
    server.listen('8080', '127.0.0.1');

    app.get('/courses', function (req, res) {
        db.all("SELECT * FROM Category").then(function(rows) {
            var file = fs.readFileSync('templates/courses.mst', "utf8");
            var html = Mustache.to_html(file, {courses: rows});
            return res.send(html);
        });
    });

    app.get('/courses/:courseid', function (req, res) {
        db.get(
            "SELECT * FROM Category WHERE id=$id",
            {$id: req.params.courseid}
        ).then(function(row) {
            var file = fs.readFileSync('templates/course.mst', "utf8");
            var html = Mustache.to_html(file, row);
            return res.send(html);
        });
    });

    app.get('/courses/search/:term', function (req, res) {
        db.all(
            "SELECT * FROM Category WHERE name LIKE '%'||$term||'%'",
            {$term: req.params.term}
        ).then(function(rows) {
            var file = fs.readFileSync('templates/courses.mst', "utf8");
            var html = Mustache.to_html(file, {courses: rows});
            return res.send(html);
        });
    });

}).catch(function(err) {
    console.log("couldn't open DB");
    console.log(err);
});
