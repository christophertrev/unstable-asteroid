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

  //Add bubble
  $('button').on('click', function(){
    var message = $('input').val();
    var messageObject = {};
    if(nodeSelected){
      // if(!nodeSelected.children){
      //   nodeSelected.children = [];
      // }
      messageObject = {message: message, parentID: nodeSelected.id};
      // nodeSelected.children.push({name: message, parent: nodeSelected.id});
    }else{
      messageObject = {message: message, parentID: 'null'};
      // treeData.push(messageObject);
    }
    socket.sendMessage(messageObject);
    // update();
  });

});

