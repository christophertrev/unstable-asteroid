'use strict';

var messageController = require('../messages/messageController'),
    Message = require('../messages/messageModel'),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    Q = require('q');

mongoose.connect('mongodb://127.0.0.1/test');

describe('MessageController Test', function() {

  beforeEach(function(done) {
    Message.remove(done);
  });

  it('should add message to array', function(done) {
    var test = {
        message: "Test",
        parentID: null
    };

    messageController.addNewMessage(test, function(createdMessage) {
      Message.find({}, function(err, foundMessages) {
        expect(foundMessages[0].message).to.eql("Test");
        done();
      });
    });
  });

  it('should get array of messages from server', function(done) {
    var test1 = {
      message: 'Test1',
      parentID: null
    };

    messageController.addNewMessage(test1, function(createdMessage1) {
      var test2 = {
        message: 'Test2',
        parentID: createdMessage1._id
      },
      test3 = {
        message: 'Test3',
        parentID: createdMessage1._id
      };

      messageController.addNewMessage(test2, function(createdMessage2) {
        messageController.addNewMessage(test3, function(createdMessage3) {
          var test4 = {
            message: 'Test4',
            parentID: createdMessage2._id
          };

          messageController.addNewMessage(test4, function(createdMessage4) {
            var messageTree = messageController.getFullMessageTree();
            expect(messageTree).to.eql(messageTree);
            done();
          });
        });
      });
    });
  });

  it('should remove lone root', function(done) {
    var test1 = {
      message: 'Test1',
      parentID: null
    };
    messageController.addNewMessage(test1, function(createdMessage1) {
      messageController.removeMessage(createdMessage1, function(err) {
        Message.find({_id: createdMessage1._id}, function(err, data) {
          expect(data).to.have.length(0);
          done();
        });
      });
    });
  });

  it('should remove leaf', function(done) {
    var test1 = {
      message: 'Test1',
      parentID: null
    };
    messageController.addNewMessage(test1, function(createdMessage1) {
      var test2 = {
        message: 'Test2',
        parentID: createdMessage1._id
      };
      messageController.addNewMessage(test2, function(createdMessage2) {
        messageController.removeMessage(createdMessage2, function(err) {
          Message.find({ _id: createdMessage2._id}, function(err, data) {
            expect(data).to.have.length(0);
            done();
          });
        });
      });
    });
  });

  it('should remove leaf and not have reference to removed child', function(done) {
    var test1 = {
      message: 'Test1',
      parentID: null
    };
    messageController.addNewMessage(test1, function(createdMessage1) {
      var test2 = {
        message: 'Test2',
        parentID: createdMessage1._id
      };
      messageController.addNewMessage(test2, function(createdMessage2) {
        messageController.removeMessage(createdMessage2, function(err) {
          Message.findOne({ _id: createdMessage1._id}, function(err, data) {
            console.log(data);
            expect(data.childrenID).to.have.length(0);
            done();
          });
        });
      });
    });
  });

});