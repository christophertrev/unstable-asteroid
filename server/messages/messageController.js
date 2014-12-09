'use strict';

var Message  = require('./messageModel'),
    Q        = require('q'),
    mongoose = require('mongoose');

//connects global mongoose variable to online MongoDB DB
mongoose.connect('mongodb://MongoLab-d:tsWFfWiQkrxfZhKZbNOBPVGp3culnVTNs5G7nyd1cbE-@ds050077.mongolab.com:50077/MongoLab-d');

/**
 * helper functions that reference and modify messages in DB
 */
module.exports = {

  /**
   * return array of constructed trees
   * @params [Function] callback to be called after successful retrieval
   */
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

  /**
   * constructs mongoose model and adds message to DB
   * @param {Object} messageObject provided by client
   * @param {Function} callback to be called if successful addition
   */
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

    //creates and saves message to DB
    createMessage(newMessage)
      .then(function(createdMessage) {
        return createdMessage;
      })
      // finds parent of the created message. pushes messageID into childrenID array of parent and saves back to DB
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

  /** middleware function that clears database and redirects to home page */
  clearDB: function(req, res) {
    Message.remove(function(err) {
      if (!err) {
        res.redirect('/storm.html');
      }
    });
  },

  /**
   * edits single message in DB
   * @param  {Object} message object provided by client
   * @param  {Function} callback to be called after reference to DB
   */
  editMessage: function(messageObject, callback) {
    Message.update({ _id: messageObject._id}, { message: messageObject.message }, function(err, updatedMessage) {
      if (!err) {
        callback();
      }
    });
  },

  /**
   * remove message from DB
   * @params [Object] message object provided by client
   * @params [Function] callback to be called if successful removal
   */
  removeMessage: function(messageObject, callback) {
    Message.remove({ _id: messageObject._id }, function(err) {

      //if messageObject has parent then update parent
      if (!err && messageObject.parentID) {
        module.exports(messageObject, callback);
      } else {
        callback();
      }
    });

  },

  /**
   * searches DB for parent of removed element and removes ID from childrenID array
   * @params {Object} child object
   * @params {Function} callback to be called after execution
   */
  removeChildReferenceFromParent: function(messageObject, callback) {
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
  },

  /**
   * creates array of messages + direct children
   * @param {[mongoose model]}
   * @returns {[Object]}
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

  /**
   * converts mongoose model to object
   * @params {mongoose model}
   * @return {Object}
   */
  cloneMessage: function(messageModel) {
    return {
      message: messageModel.message,
      _id: messageModel._id,
      childrenID: messageModel.childrenID,
      parentID: messageModel.parentID,
    }
  },

  /**
   * constructs tree provided root and array of all messages
   * @params {Object} mongoose object
   * @params {[mongoose models]} array of all messages fetched by DB
   */
  constructTree: function(root, arrayOfMessages) {
    var root = module.exports.cloneMessage(root);
    root.children = [];
    for (var i = 0; i < root.childrenID.length; i++) {
      var child = module.exports.findMessageByID(root.childrenID[i], arrayOfMessages);
      root.children.push(module.exports.constructTree(child, arrayOfMessages));
    }
    return root;
  },

  /**
   * searches array of messags and searches for ID
   * @params {mongoose objectID}
   * @params  {[mongoose models]}
   * @return {[mongoose models]}
   */
  findMessageByID: function(ID, arrayOfMessages) {
    for(var i = 0; i < arrayOfMessages.length; i++) {
      if (String(arrayOfMessages[i]._id) === String(ID)) {
        return arrayOfMessages[i];
      }
    }
  }
};