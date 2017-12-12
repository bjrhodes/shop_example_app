var http = require("http");
var express = require("express");
var app = express();

var fs = require("fs");
var sqlite = require('sqlite');
var mustache = require('mustache');

var host = "http://localhost:8080";
function isAuthed() {
    return false;
}

sqlite.open('./database.sqlite').then(function(db) {

    app.use(express.static(__dirname + '/public'));

    /**
     * NEW API ROUTES!
     */
    app.get('/api', function(req, res) {
        return res.json({
            resources:[
                {
                    name: "courses",
                    routes: [
                        {method: 'get', url: host + "/api/courses", desc: 'List courses'},
                        {method: 'post', url:  host + "/api/course", desc: 'Add a course'}
                    ]
                }
            ]
        });
    });
    app.get('/api/courses', function(req, res) {
        db.all("SELECT * FROM Courses").then(function(rows) {
            var courses = rows.map(function(row) {
                return {
                    id: row.id,
                    name: row.name,
                    url: host + "/api/courses/" + row.id
                };
            })
            return res.json(courses);
        });
    });
    app.get('/api/courses/:id', function(req, res) {
        db.get("SELECT * FROM Courses WHERE id=$id", {$id:req.params.id}).then(function(course) {
            if (course) {
                course.url = host + "/api/courses/" + course.id;
                return res.json(course);
            } else {
                res.status = 404;
                return res.json({error: "not found"});
            }
        });
    });
    app.post('/api/course', function(req, res) {
        if (!isAuthed()) {
            res.status = 401;
            return res.json({error: "not authorised"});
        }
        db.run("INSERT INTO Courses SET name=$name", {$name: req.body.name}).then(function(course) {
            if (success) {
                return res.json({status: "Course inserted", url: host + "/api/courses/" + db.lastInsertId()});
            } else {
                res.status = 500;
                return res.json({error: "insert failed"});
            }
        });
    });
    app.put('/api/courses/:id', function(req, res) {
        if (!isAuthed()) {
            res.status = 401;
            return res.json({error: "not authorised"});
        }
        db.run("UPDATE Courses SET name=$name WHERE id=$id", {$id:req.params.id, $name: req.body.name}).then(function(course) {
            if (success) {
                return res.json({status: "Course updated", url: host + "/api/courses/" + req.params.id});
            } else {
                res.status = 404;
                return res.json({error: "Course not found"});
            }
        });
    });
    app.delete('/api/courses/:id', function(req, res) {
        if (!isAuthed()) {
            res.status = 401;
            return res.json({error: "not authorised"});
        }
        db.run("DELETE FROM Courses WHERE id=$id", {$id: req.params.id}).then(function(course) {
            if (success) {
                return res.json({status: "Course deleted"});
            } else {
                res.status = 500;
                return res.json({error: "Delete failed"});
            }
        });
    });






    app.get('/courses', function (req, res) {
        db.all("SELECT * FROM Courses").then(function(rows) {
            var file = fs.readFileSync('templates/courses-page.mst', "utf8");
            var html = mustache.to_html(file, {courses: rows});
            return res.send(html);
        });
    });

    app.get('/courses/search/:term?', function (req, res) {
        db.all(
            "SELECT * FROM Category WHERE name LIKE '%'||$term||'%'",
            {$term: req.params.term || req.query.term}
        ).then(function(rows) {
            var file = fs.readFileSync('templates/courses-page.mst', "utf8");
            var html = mustache.to_html(file, {courses: rows});
            return res.send(html);
        });
    });


    var server = http.createServer(app);
    console.log("Listening on http://127.0.0.1:8080");
    server.listen('8080', '127.0.0.1');

}).catch(function(err){
  console.error(err.stack);
});

