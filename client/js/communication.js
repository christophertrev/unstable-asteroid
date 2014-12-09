//Socket class for sending/recieving messages from socket
//Creates connection on object creation 
var Socket = function(){
  this.connection = io();
};

//Sends message with new message event
Socket.prototype.sendMessage = function(message){
  this.connection.emit('new message', message);
};

//Sends message with edit event
Socket.prototype.sendEdit = function(message){
  this.connection.emit('edit message', message);
};

//Sends message with delete event
Socket.prototype.sendDelete = function(message){
  this.connection.emit('remove message leaf', message);
};

//Sets callback for when 'all messages' event is recieved
Socket.prototype.onAllMessages = function(callback){
  this.connection.on('all messages', function(messageReceived){
    callback(messageReceived);
  });
};
