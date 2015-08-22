var tempCollection = new Mongo.Collection("tempCollection");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('body', '');
  

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    body: function() {
      var entry =  tempCollection.findOne({ id: 0 });
      if (!entry) {
        return '';
      }
      else {
        return entry.body;
      }
    }
  });

  Template.hello.events({
    'click button': function () {
      Session.set('counter', Session.get('counter') + 1);
      Meteor.call("phantomJSTest");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Meteor.methods({
  phantomJSTest: function () {
    console.log("phantomJSTest");
    
    var Future = Meteor.npmRequire("fibers/future");
    var Childprocess = Meteor.npmRequire('child_process');

    var childArgs = [ '--loglevel=debug', 'assets/app/casper.js' ];

    var future = new Future();
    Childprocess.execFile('casperjs', childArgs, Meteor.bindEnvironment(function(err, stdout, stderr) {
        // handle results
        console.log(stdout);
        
        var newbody = { id: 0, body: stdout };
        var oldbody = tempCollection.findOne({ id: 0 });
        /*if (!oldbody) {
          tempCollection.insert(newbody);
        }
        else {
          tempCollection.update({ id: newbody.id }, { $set: { body: newbody.body } });
        }*/
        future.return(err);
    }, function (err) { console.log("couldn't wrap the callback"); }));
    return future.wait();
  }
});