var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var messageController = require('./messages/messageController');

mongoose.connect('mongodb://MongoLab-d:tsWFfWiQkrxfZhKZbNOBPVGp3culnVTNs5G7nyd1cbE-@ds050077.mongolab.com:50077/MongoLab-d');

app.use(express.static(__dirname + '/../client') );
app.use(express.static(__dirname + '/../client/styles') );

app.get('/', function(req, res) {
  res.render('index');
});

io.on('connection', function(socket) {
  //send all current messages to the newly connected user
  socket.emit('all messages', messageController.getFullMessageTree() );

  socket.on('new message', function(msg) {
    messages.addMessage(msg);
    io.emit('all messages', messageController.addNewMessage() );
  });
});

var port = process.env.PORT || 8000;
http.listen(port);