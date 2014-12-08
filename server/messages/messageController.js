'use strict';

var Message = require('./messageModel'),
    Q       = require('q');

/**
 * [contains helper function to add messages to tree and fetch entire tree]
 * @type {Object}
 */
module.exports = {

  //returns array of all messages on db
  getFullMessageTree: function(callback) {
    var getMessageTree = Q.nbind(Message.find, Message);

    getMessageTree({})
      .then(function (messages) {
        callback(module.exports.constructRootsArray(messages));
      })
      .fail(function (error) {
        console.log(error);
      });
  },

  //adds message to db
  //@params [Object (message, parentID)]
  addNewMessage: function (messageObject, callback) {
    if (messageObject.parentID === 'null') {
      messageObject.parentID = null;
    }
    var newMessage = {
      message: messageObject.message,
      parentID: messageObject.parentID,
      childrenID: []
    };

    //creates promises of query functions
    var createMessage = Q.nbind(Message.create, Message);
    var findMessage = Q.nbind(Message.find, Message);

    //creates and saves message to db
    createMessage(newMessage)
      .then(function(createdMessage) {
        return createdMessage;
      })
      // finds parent of the created message. pushes messageID into childrenID array of parent and saves back to db
      .then(function(createdMessage) {
        findMessage({ _id: createdMessage.parentID })
          .then(function(foundParent) {
            if (foundParent.length !== 0) {
              foundParent[0].childrenID.push(createdMessage._id);
              Message.update({_id: createdMessage.parentID}, {
                childrenID: foundParent[0].childrenID
              }, function(err, data) {
                callback(createdMessage);
              });
            } else {
              callback(createdMessage);
            }
          });
      });
  },

  //middleware function that clears DB
  clearDB: function(req, res) {
    Message.remove(function(err) {
      if (!err) {
        res.redirect('/storm.html');
      }
    });
  },

  /**
   * edits single message in DB
   * @param  {[Object]}   messageObject
   * @param  {Function} callback
   * @return {[type]}
   */
  editMessage: function(messageObject, callback) {
    Message.update({ _id: messageObject._id}, { message: messageObject.message }, function(err, updatedMessage) {
      if (!err) {
        callback();
      }
    });
  },

  removeMessage: function(messageObject, callback) {
    Message.remove({ _id: messageObject._id }, function(err) {

      //if messageObject has parent then update parent
      if (!err && messageObject.parentID) {
        Message.findOne({_id: messageObject.parentID}, function(err, foundParent) {
          var childrenID = foundParent.childrenID;
          var updatedChildrenID = [];

          childrenID.forEach(function(ID) {
            if (String(ID) !== String(messageObject._id)) {
              updatedChildrenID.push(ID);
            }
          });

          Message.update({_id: messageObject.parentID}, {childrenID: updatedChildrenID}, function(err, data) {
            callback();
          });
        });
      } else {
        callback();
      }
    });

  },

  //removes ID from all childrenID arrays //NOT USED
  removeChildReferenceFromParent: function(messageObject, callback) {
    Message.findOne({_id: messageObject.parentID}, function(err, foundParent) {
      var childrenID = foundParent.childrenID;
      var updatedChildrenID = [];
      childrenID.forEach(function(ID) {
        if (ID !== messageObject._id) {
          updatedChildrenID.push(ID);
        }
      });
    });

  },

  /**
   * creates array of messages + direct children
   * @param {[Array]}
   * @returns {[Array]}
   */
  constructRootsArray: function(arrayOfMessages) {
    var messages = [],
        roots = [];

    //clones tree to objects
    messages = arrayOfMessages.map(function(message) {
      return module.exports.cloneMessage(message);
    });

    //pushes messages without parents into roots array
    messages.forEach(function(message) {
      if (!message.parentID) {
        roots.push(message);
      }
    });

    roots = roots.map(function(root) {
      return module.exports.constructTree(root, messages);
    });

    return roots;
  },

  cloneMessage: function(messageModel) {
    return {
      message: messageModel.message,
      _id: messageModel._id,
      childrenID: messageModel.childrenID,
      parentID: messageModel.parentID,
    }
  },

  //constructs entire tree
  constructTree: function(root, arrayOfMessages) {
    var root = module.exports.cloneMessage(root);
    root.children = [];
    for (var i = 0; i < root.childrenID.length; i++) {
      var child = module.exports.findMessageByID(root.childrenID[i], arrayOfMessages);
      root.children.push(module.exports.constructTree(child, arrayOfMessages));
    }
    return root;
  },

  findMessageByID: function(ID, arrayOfMessages) {
    for(var i = 0; i < arrayOfMessages.length; i++) {
      if (String(arrayOfMessages[i]._id) === String(ID)) {
        return arrayOfMessages[i];
      }
    }
  }
};