var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var messageController = require('./messages/messageController');

mongoose.connect('mongodb://MongoLab-d:tsWFfWiQkrxfZhKZbNOBPVGp3culnVTNs5G7nyd1cbE-@ds050077.mongolab.com:50077/MongoLab-d');

app.use(express.static(__dirname + '/../client') );
app.use(express.static(__dirname + '/../client/styles') );
app.use('/docs', express.static(__dirname + '/../docs')  )

app.get('/', function(req, res) {
  res.render('index');
});

//clears DB
app.get('/storm.html/clear', function(req, res) {
messageController.clearDB(req, res);
});

io.on('connection', function(socket) {
  //send all current messages to the newly connected user
  console.log('Connected with user');
  messageController.getFullMessageTree(function(messages) {
    socket.emit('all messages', messages);
  });

  socket.on('new message', function(msg) {
    console.log('in new message, message is: ', msg);
    messageController.addNewMessage(msg, function() {
      messageController.getFullMessageTree(function(messages) {
         io.emit('all messages', messages);
      });
    });
  });
});

var port = process.env.PORT || 8000;
http.listen(port);