// Initiaize CasperJS
var casper = require('casper').create({
    
});

var g_loadingurl = '';
var g_codelisturl = '';

casper.userAgent('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)');

casper.on('page.resource.requested', function(request) {
    this.echo('page.resource.requested: ' + g_loadingurl);
    require('utils').dump(request);
    if (request.url.match(/EdinetCodeDownload/) && g_codelisturl.length == 0) {
        g_codelisturl = request.url;
        this.echo('aborting request');
        request.abort();
    }
});

casper.on('page.resource.received', function(response) {
    this.echo('page.resource.received');
    require('utils').dump(response);
});

casper.on('resource.error', function(error) {
    this.echo('resource.error');
    require('utils').dump(error);
});

casper.start('http://disclosure.edinet-fsa.go.jp/');

casper.then(function() {
    this.echo('Click ' + 'EDINETタクソノミ及びコードリスト');
    this.clickLabel('EDINETタクソノミ及びコードリスト');
});

casper.then(function() {
    this.echo('Click a[href*="EdinetCodeListDownloadAction"]');
    this.click('a[href*="EdinetCodeListDownloadAction"]');
});

casper.waitFor(function() { return g_codelisturl; }, function() {
    this.echo('requesting g_codelist');
    this.download(g_codelisturl, 'edinetcode.zip');
}, function() {
    this.echo('timeout').exit();
}, 60000);

casper.then(function() {
    this.echo('Code list received ' + g_loadingurl).exit();
});

casper.run();
