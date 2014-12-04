var express = require('express');
var http = require('http');

var app = express();
app.use(express.static(__dirname + '/../client') );
app.use(express.static(__dirname + '/../client/styles') );

app.get('/', function(req, res) {
  res.render('index');
});

var port = process.env.PORT || 8000;
app.listen(port);