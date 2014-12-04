'use strict';

var Message = require('../messages/messageModel'),
              should            = require('should'),
              mongoose          = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/test');

describe('MessageModel Test', function() {
  it('should store single message', function (done) {
    Message.remove(function() {
      var test = {
        message: "Test",
        parentID: 234,
        childrenID: [354]
      };

      Message.create(test, function (err, message) {
        should.not.exist(err);
        message.should.have.property('message','Test');
        done();
      });
    });
  });

  it('should retrive single message from database', function (done) {
    Message.find({}, function (err, messages) {
      messages[0].should.have.property('message', 'Test');
      done();
    });
  });
});

