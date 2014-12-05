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
        callback(module.exports.constructTree(messages));
      })
      .fail(function (error) {
        console.log('error');
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
        callback();
        return createdMessage;
      });

      //finds parent of the created message. pushes messageID into childrenID array of parent and saves back to db
      // .then(function(createdMessage) {
      //   findMessage({ _id: createdMessage.parentID })
      //     .then(function(foundParent) {
      //       if (foundParent) {
      //         foundParent.childrenID.push(createdMessage._id);
      //         foundParent.save(function() {
      //           Message.find({}, function(messages) {
      //             console.log('db size', messages)
      //           });
      //         });
      //       }
      //     });
      // });
  },

  /**
   * creates array of messages + direct children
   * @param { Array }
   * @returns
   */
  constructTree: function(arrayOfMessages) {
    var messages = [];

    // pushes roots to array
    arrayOfMessages.forEach(function(message) {

      //adds new children array property to messages
      message.children = [];

      message.childrenID.forEach(function(childID) {

        //checks entire message array for matching childID and then pushes those messages into children property
        arrayOfMessages.forEach(function(messageToCompare) {
          if (messageToCompare._id.equals(childID)) {
            message.children.push(messageToCompare);
          }
        });
      });

      messages.push(message);
    });

    return messages;
  }
};
