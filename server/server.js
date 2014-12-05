var express = require('express');
var http = require('http');
var io = require('socket.io')(http);

var app = express();
app.use(express.static(__dirname + '/../client') );
app.use(express.static(__dirname + '/../client/styles') );

app.get('/', function(req, res) {
  res.render('index');
});

io.on('connection', function(socket) {
  //send all current messages to the newly connected user
  socket.emit('all messages', messages.getMessages() );

  socket.on('new message', function(msg) {
    messages.addMessage(msg);
    io.emit('all messages', messages.getMessages() );
  });
});

var port = process.env.PORT || 8000;
app.listen(port);



//*******
//
//create fake initial data until we're hooked up to the database
//
//*******

var messages = {
  _nextUniqueID: 0,
  _storage: [],

  root: undefined,

  addMessage: function(msg) {
    msg.id = messages._nextUniqueID++;
    msg.children = msg.children || [];
    messages._storage.push(msg);

    //set the added message as the root if no root
    if (!messages.root) {
      messages.root = msg;
      return;
    }

    //add the added message as a child to its parent
    if (msg.parentId !== undefined) {
      for (var i = 0; i < messages._storage.length; ++i) {
        var node = messages._storage[i];

        if (node.id === msg.parentId) {
          node.children.push(msg);
          break;
        }
      }
    }
  },

  getMessages: function() {
    return root;
  }
};

messages.addMessage({text: 'hi', parentId: null});
messages.addMessage({text: 'bye', parentId: 0});
messages.addMessage({text: 'what?', parentId: 0});
messages.addMessage({text: 'whatever', parentId: 1});