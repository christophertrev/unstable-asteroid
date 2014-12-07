//Tree is empty object
treeData = [];

function setTreeData(data){
  treeData = data ? data : treeData;
  update();
};

$(document).ready(function(){

  //Make connection 
  var socket = new Socket();

  //Set listener
  socket.onAllMessages(setTreeData);

  //Add bubble on submit
  $('.inputbox').on('submit', function(e){
    e.preventDefault();
    console.log('hello')
    var message = $('.messageBox').val();
    $('.messageBox').val('');
    var messageObject = {};
    if(nodeSelected){
      //Send over message and parentID
      messageObject = {message: message, parentID: nodeSelected};
    }else{
      messageObject = {message: message, parentID: 'null'};
    }
    socket.sendMessage(messageObject);
  });

});

