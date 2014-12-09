
var Socket = function(){
  console.log('Attempting Connection');
  this.connection = io();
  console.log(this.connection);

  //what happens if there is not a connection available?!
};

Socket.prototype.sendMessage = function(message){
  console.log('sending message');
  // console.log(message);
  this.connection.emit('new message', message);
};

Socket.prototype.onAllMessages = function(callback){
  this.connection.on('all messages', function(messageReceived){
    console.log('recieved all messages');
    // console.log(messageReceived);
    callback(messageReceived);
  });
};

Socket.prototype.sendEdit = function(message){
  console.log('sending Edits for',message);
  this.connection.emit('edit message', message);
};

Socket.prototype.sendDelete = function(message){
  console.log('Sending delete for ',message);
  this.connection.emit('remove message leaf', message);
};

