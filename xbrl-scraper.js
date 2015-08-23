var tempCollection = new Mongo.Collection("tempCollection");
var serverPath = '';

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
    serverPath = process.env["PWD"] + "/public/";
  });
}

Meteor.methods({
  phantomJSTest: function () {
    console.log("phantomJSTest");
    
    //var Future = Meteor.npmRequire("fibers/future");
    var Fs = Meteor.npmRequire('fs');
    var exec = Meteor.wrapAsync(Npm.require('child_process').exec);
    
    //var future = new Future();
    var result = exec('casperjs --ignore-ssl-errors=yes assets/app/casperjs/getedinetcodelist.js');
    var content = Fs.readFileSync('EdinetcodeDlInfo_UTF8.csv');
    console.log(content.toString());
    
    /*var newbody = { id: 0, body: content };
    var oldbody = tempCollection.findOne({ id: 0 });
    if (!oldbody) {
      tempCollection.insert(newbody);
    }
    else {
      tempCollection.update({ id: newbody.id }, { $set: { body: newbody.body } });
    }*/
    /*Childprocess.execFile('casperjs', childArgs, Meteor.bindEnvironment(function(err, stdout, stderr) {
        // handle results
        if (!err) {
          //var edinetcode = fs.readFileSync(path + '/EdinetcodeDlInfo_UTF8');
          fs.readFile('EdinetcodeDlInfo_UTF8.csv', function() {
            var newbody = { id: 0, body: stdout };
            var oldbody = tempCollection.findOne({ id: 0 });
            if (!oldbody) {
              tempCollection.insert(newbody);
            }
            else {
              tempCollection.update({ id: newbody.id }, { $set: { body: newbody.body } });
            }
          });
        }
        future.return(err);
    }, function (err) { console.log("couldn't wrap the callback"); }));*/
    //return future.wait();
  }
});