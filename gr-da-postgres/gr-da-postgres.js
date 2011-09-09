
/* Import modules */
var config = require('./config')
require('./utils');


/* Create server */
var http = require('http').createServer()
,   io = require('socket.io').listen(http)
http.listen(config.web.port);


/* Init Postgres connection */
var Pg = require('pg')
,   pg = new Pg.Client(
        'tcp://' + config.pg.user + 
        ':' + config.pg.password +
        '@' + config.pg.host +
        '/' + config.pg.dbname);
pg.connect();


/* Init logging */
/*
var fs = require('fs')
,   Log = require('log')
,   log = new Log(Log.INFO, fs.createWriteStream(config.log.file));
*/

io.sockets.on('connection', function (socket) {
    initRequestProcessing(socket);
});


function initRequestProcessing(socket) {
    
    socket.on('getHoles', function (data) {
        pg.query("SELECT ST_AsGeoJSON(hole) FROM holes;", function (err, result) {
            if (err) {
                console.log(err);
            } else {
                var holes = [];
                result.rows.forEach(function(row) {
                    var point  = JSON.parse(row.st_asgeojson);
                    holes.push({
                        lat: point.coordinates[0],
                        lon: point.coordinates[1]
                    });
                });
                socket.emit('holes', { holes : holes });
            }
        });
    });


    socket.on('addHole', function (data) {
        pg.query(
            "INSERT INTO holes(hole) VALUES(ST_GeographyFromText('SRID=4326;POINT({0} {1})'));"
            .format(
                data.hole.lat,
                data.hole.lon));
    });


    socket.on('removeHole', function (data) {
        pg.query(
            "DELETE FROM holes WHERE hole = ST_GeographyFromText('SRID=4326;POINT({0} {1})');"
            .format(
                data.hole.lat,
                data.hole.lon));
    });
}

