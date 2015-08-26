var tempCollection = new Mongo.Collection("tempCollection");
var edinetcodeCollection = new Mongo.Collection("edinetcodeCollection");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('body', '');
  

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    edinetcodes: function() {
      return edinetcodeCollection.find({});
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
    
    var Fs = Meteor.npmRequire('fs');
    var exec = Meteor.wrapAsync(Meteor.npmRequire('child_process').exec);
    var parse = Meteor.npmRequire('csv').parse;

    console.log('calling casperjs');
    var result = exec('casperjs --ignore-ssl-errors=yes assets/app/casperjs/getedinetcodelist.js');
    
    // Parse CSV
    console.log('parsing downloaded csv');
    var source = Fs.createReadStream('assets/app/casperjs/EdinetCode_UTF8.csv');
    var parser = parse({ 'auto_parse': true, 'columns': ['edinetcode', 'orgtype', 'listtype', 'consolidated', 'capital', 'settlementday', 'name', 'name_en', 'name_kana', 'address', 'sector', 'ticker_jp'] });
    
    parser.on('readable', Meteor.bindEnvironment(function() {
      var record;
      while(record = parser.read()) {
        var entry = edinetcodeCollection.findOne({ 'edinetcode': record.edinetcode });
        if (!entry && record.edinetcode.match(/E\d+/) != null) {
          edinetcodeCollection.insert(record);
        }
      }
    }));
    
    /*source.on('error', function(err) {
      console.log(err);
    });
    
    source.on('end', function() {
      console.log('end');
    });*/
    
    source.pipe(parser);
    
    console.log('end');
    //source.pipe(process.stdout);
    
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