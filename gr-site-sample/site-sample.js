var stylus = require('stylus'),
    express = require('express'),
    app = express.createServer();

var views = __dirname + '/views';
var pub = __dirname + '/public';

app.set('views', views);
app.set('view engine', 'jade');

app.use(stylus.middleware({
  src: views, 
  dest: pub,
  compile: function compile(str, path) {
    return stylus(str).set('filename', path)
  }
}));

app.use(app.router);
app.use(express.errorHandler({ dump: true, stack: true }));
app.use(express.logger({ format: ':method :url' }));
app.use(express.static(pub));

app.get('/', function(req, res) {
    res.render('index');
});

app.listen(3001);
