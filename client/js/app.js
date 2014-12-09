//Tree is empty object
treeData = [];

function setTreeData(data){
  treeData = data ? data : treeData;
  update();
};

function allowRemoval(data){
  $('.btn.remove').show();
}

function disallowRemoval(data){
  $('.btn.remove').hide();
}

$(document).ready(function(){

  $('.btn.remove').hide();

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
      messageObject = {message: message, parentID: nodeSelected._id};
    }else{
      messageObject = {message: message, parentID: 'null'};
    }
    socket.sendMessage(messageObject);
  });

  $('.btn.edit').on('click',function(e){
    //emit message to db
    var message = $('.messageBox').val();
    $('.messageBox').val('');
    var messageObject = {};
    if(nodeSelected){
      //Send over message and parentID
      messageObject = {message: message, _id: nodeSelected._id};
      socket.sendEdit(messageObject);
    }
  });

  $('.btn.remove').on('click',function(e){
    //emit message to db
    var messageObject = {};
      //Send over id and and parentID
      messageObject = {_id: nodeSelected._id, parentID: nodeSelected.parentID};
      socket.sendDelete(messageObject);
    
    $(this).hide();
  });

});

