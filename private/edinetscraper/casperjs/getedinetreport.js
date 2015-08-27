// Required external tools
// nkf (to convert SJIS cvs to UTF-8)
// unzip (to unzip edinetcode.zip)

var g_unzippath = '/usr/bin/unzip';
var g_nkfpath = '/usr/bin/nkf';
var g_edinetcode = 'E02367';
var g_edinetreportzip = g_edinetcode + '.zip';
var g_edinetreportcsv = 'XbrlSearchDlInfo.csv';
var g_edinetreportutf8csv = 'XbrlSearchDlInfo_UTF8.csv';

// Initialize PhantomJS fs
var fs = require('fs');

// Initiaize CasperJS
var casper = require('casper').create();

casper.waitForFileExec = function(process, args, callback, onTimeout, timeout){
    this.then(function(){
        var cp = require('child_process'),
            finished = false,
            self = this;
        timeout = timeout === null || this.options.stepTimeout;
        cp.execFile(process, args, {}, function(error, stdout, stderr) {
            finished = true;
            callback.call(self, error, stdout, stderr);
        });
        this.waitFor(function check(){
            return finished;
        }, null, onTimeout, timeout);
    });
    return this; // for builder/promise pattern
};

var g_loadingurl = '';
var g_reporturl = '';

casper.userAgent('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)');

casper.on('page.resource.requested', function(request) {
    this.echo('page.resource.requested: ' + request.url);
    //require('utils').dump(request);
    if (request.url.match(/download/) && g_reporturl.length == 0) {
        g_reporturl = request.url;
        this.echo('aborting request');
        request.abort();
    }
});

casper.on('page.resource.received', function(response) {
    this.echo('page.resource.received ' + response.url);
    //require('utils').dump(response);
});

casper.on('resource.error', function(error) {
    this.echo('resource.error ' + error);
    //require('utils').dump(error);
});

casper.setFilter("page.confirm", function(msg) {
    return true;
});

casper.start('http://disclosure.edinet-fsa.go.jp/');

casper.then(function() {
    this.echo('Click ' + '書類検索');
    this.click('img[alt="書類検索"]');
});

casper.then(function() {
    this.fill('form#control_object_class1', {
        mul: g_edinetcode,
        fls: true,
        lpr: false,
        oth: false,
        pfs: 5
    }, false);
    this.echo('Click input[onclick*="SendSearchAction"]');
    this.click('input[onclick*="SendSearchAction"]');
});

casper.then(function() {
    this.echo('Click input#xbrlbutton');
    this.click('input#xbrlbutton');
});

casper.waitFor(function() { return g_reporturl; }, function() {
    this.echo('requesting ' + g_reporturl);
    this.download(g_reporturl, g_edinetreportzip);
}, function() {
    this.echo('timeout').exit();
}, 60000);

casper.waitForFileExec(g_unzippath, ['-o', g_edinetreportzip, '-d', g_edinetcode], function (err, stdout, stderr) {
    this.echo('unzip: Callback');
    if (err) {
        this.echo('Failed to unzip ' + err).exit();
    }
    else {
        this.echo('Calling nkf to convert SJIS csv to UTF-8 csv');
        casper.waitForFileExec(g_nkfpath, ['-w', '-Lu', '-d', g_edinetcode + '/' + g_edinetreportcsv], function (err, stdout, stderr) {
            fs.write(g_edinetcode + '/' + g_edinetreportutf8csv, stdout, 'w');
        }, function() {
            this.echo('Failed to nkf: Timeout');
        }, 60000);
    }
}, function() {
    this.echo('Failed to unzip: Timeout');
}, 60000);

casper.run();
