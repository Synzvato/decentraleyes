/**
 * Imports
 */

var requestAnalyzer = require("../lib/request-analyzer");

/**
 * Variables
 */

var localPaths = {
    angular: 'resources/angularjs/1.2.19/angular.min.js.dec',
    backbone: [
        'resources/backbone.js/0.9.2/backbone-min.js.dec',
        'resources/backbone.js/1.1.2/backbone-min.js.dec'
    ],
    dojo: 'resources/dojo/1.8.3/dojo/dojo.js.dec',
    ember: [
        'resources/ember.js/1.1.0/ember.min.js.dec',
        'resources/ember.js/2.1.0/ember.min.js.dec'
    ],
    extCore: 'resources/ext-core/3.1.0/ext-core.js.dec',
    jQuery: [
        'resources/jquery/1.10.2/jquery.min.js.dec',
        'resources/jquery/1.11.1/jquery.min.js.dec'
    ],
    jQueryUI: 'resources/jqueryui/1.10.2/jquery-ui.min.js.dec',
    modernizr: 'resources/modernizr/2.6.2/modernizr.min.js.dec',
    mootools: 'resources/mootools/1.4.5/mootools-yui-compressed.js.dec',
    prototypeJS: 'resources/prototype/1.6.1.0/prototype.js.dec',
    scriptaculous: 'resources/scriptaculous/1.9.0/scriptaculous.js.dec',
    swfobject: 'resources/swfobject/2.2/swfobject.js.dec',
    underscore: [
        'resources/underscore.js/1.3.3/underscore-min.js.dec',
        'resources/underscore.js/1.4.4/underscore-min.js.dec',
        'resources/underscore.js/1.6.0/underscore-min.js.dec'
    ],
    webfont: [
        'resources/webfont/1.0.19/webfont.js.dec',
        'resources/webfont/1.5.18/webfont.js.dec'
    ]
};

/**
 * Is Valid Candidate Tests
 */

exports['test get request to known cdn'] = function (assert) {
    
    var result = requestAnalyzer.isValidCandidate({
        requestMethod: 'GET', URI: { host: 'ajax.googleapis.com' }
    });

    assert.ok(result, 'Valid candidate was successfully identified.');
};

exports['test post request to known cdn'] = function (assert) {
    
    var result = requestAnalyzer.isValidCandidate({
        requestMethod: 'POST', URI: { host: 'ajax.googleapis.com' }
    });

    assert.equal(result, false, 'Invalid candidate was successfully identified.');
};

exports['test get request to unknown domain'] = function (assert) {
    
    var result = requestAnalyzer.isValidCandidate({
        requestMethod: 'GET', URI: { host: 'ajax.example.com' }
    });

    assert.equal(result, false, 'Invalid candidate was successfully identified.');
};

exports['test get request from whitelisted domain'] = function (assert) {
    
    require('sdk/simple-prefs').prefs.domainWhitelist = 'example.com';

    var result = requestAnalyzer.isValidCandidate({
        requestMethod: 'GET', URI: { host: 'ajax.googleapis.com' },
            referrer: { host: 'example.com' }, setRequestHeader: function () { return false; }
    });

    assert.equal(result, false, 'Whitelisted request was successfully ignored.');
};

/**
 * Get Local Target Tests
 */

exports['test regular resource'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/jquery/2.1.4/jquery.js');
    assert.equal(target.path, 'resources/jquery/2.1.4/jquery.min.js.dec', 'Target found for regular resource.');
};

exports['test minified resource'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('code.jquery.com', '/jquery-2.1.4.min.js');
    assert.equal(target.path, 'resources/jquery/2.1.4/jquery.min.js.dec', 'Target found for minified resource.');
};

exports['test resource shorthand'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/jquery/1/jquery.js');
    assert.equal(target.path, 'resources/jquery/1.11.1/jquery.min.js.dec', 'Target found for resource shorthand.');
};

exports['test precision of mapping expression'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('code.jquery.com', '/jquery-module-1.2.1.js');
    assert.equal(target, false, 'Resource was not mistaken for similar one.');
};

exports['test ignoring jquery-ui stylesheet'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/jqueryui/1.0.0/jquery-ui.css');
    assert.equal(target, false, 'jQuery UI\'s stylesheet was ignored.');
};

exports['test dojo uncompressed library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/dojo/1.8.3/dojo/dojo.uncompressed.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ext-core debug library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/ext-core/3.1.0/ext-core-debug.js');
    assert.equal(target.path, localPaths.extCore, 'Target was determined.');
};

exports['test webfont debug library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/webfont/1.0.19/webfont_debug.js');
    assert.equal(target.path, localPaths.webfont[0], 'Target was determined.');
};

// Google Hosted Libraries

exports['test angular on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/angularjs/1.2.19/angular.min.js');
    assert.equal(target.path, localPaths.angular, 'Target was determined.');
};

exports['test dojo on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/dojo/1.8.3/dojo/dojo.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ext-core on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/ext-core/3.1.0/ext-core.js');
    assert.equal(target.path, localPaths.extCore, 'Target was determined.');
};

exports['test jquery on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/jquery/1.11.1/jquery.min.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test mootools on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js');
    assert.equal(target.path, localPaths.mootools, 'Target was determined.');
};

exports['test prototype on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/prototype/1.6.1.0/prototype.js');
    assert.equal(target.path, localPaths.prototypeJS, 'Target was determined.');
};

exports['test scriptaculous on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/scriptaculous/1.9.0/scriptaculous.js');
    assert.equal(target.path, localPaths.scriptaculous, 'Target was determined.');
};

exports['test swfobject on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/swfobject/2.2/swfobject.js');
    assert.equal(target.path, localPaths.swfobject, 'Target was determined.');
};

exports['test webfont on google hosted libraries'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.googleapis.com', '/ajax/libs/webfont/1.5.18/webfont.js');
    assert.equal(target.path, localPaths.webfont[1], 'Target was determined.');
};

// Microsoft Ajax CDN

exports['test jquery on microsoft ajax cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.aspnetcdn.com', '/ajax/jQuery/jquery-1.11.1.min.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test modernizr on microsoft ajax cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.aspnetcdn.com', '/ajax/modernizr/modernizr-2.6.2.js');
    assert.equal(target.path, localPaths.modernizr, 'Target was determined.');
};

exports['test jquery on old microsoft ajax cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.microsoft.com', '/ajax/jQuery/jquery-1.11.1.min.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test modernizr on old microsoft ajax cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('ajax.microsoft.com', '/ajax/modernizr/modernizr-2.6.2.js');
    assert.equal(target.path, localPaths.modernizr, 'Target was determined.');
};

// CDNJS (Cloudflare)

exports['test angular on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/angular.js/1.2.19/angular.min.js');
    assert.equal(target.path, localPaths.angular, 'Target was determined.');
};

exports['test backbone on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/backbone.js/0.9.2/backbone-min.js');
    assert.equal(target.path, localPaths.backbone[0], 'Target was determined.');
};

exports['test dojo on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/dojo/1.8.3/dojo.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ember on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/ember.js/2.1.0/ember.min.js');
    assert.equal(target.path, localPaths.ember[1], 'Target was determined.');
};

exports['test ext-core on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/ext-core/3.1.0/ext-core.min.js');
    assert.equal(target.path, localPaths.extCore, 'Target was determined.');
};

exports['test jquery on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/jquery/1.11.1/jquery.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test modernizr on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/modernizr/2.6.2/modernizr.min.js');
    assert.equal(target.path, localPaths.modernizr, 'Target was determined.');
};

exports['test mootools on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/mootools/1.4.5/mootools-core-full-nocompat.js');
    assert.equal(target.path, localPaths.mootools, 'Target was determined.');
};

exports['test scriptaculous on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/scriptaculous/1.9.0/scriptaculous.min.js');
    assert.equal(target.path, localPaths.scriptaculous, 'Target was determined.');
};

exports['test swfobject on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/swfobject/2.2/swfobject.js');
    assert.equal(target.path, localPaths.swfobject, 'Target was determined.');
};

exports['test underscore on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/underscore.js/1.6.0/underscore-min.js');
    assert.equal(target.path, localPaths.underscore[2], 'Target was determined.');
};

exports['test webfont on cdnjs'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdnjs.cloudflare.com', '/ajax/libs/webfont/1.5.18/webfontloader.js');
    assert.equal(target.path, localPaths.webfont[1], 'Target was determined.');
};

// jQuery CDN (MaxCDN)

exports['test jquery on jquery cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('code.jquery.com', '/jquery-1.11.1.min.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on jquery cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('code.jquery.com', '/ui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

// jsDelivr (MaxCDN)

exports['test angular on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/angularjs/1.2.19/angular.min.js');
    assert.equal(target.path, localPaths.angular, 'Target was determined.');
};

exports['test backbone on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/backbonejs/1.1.2/backbone-min.js');
    assert.equal(target.path, localPaths.backbone[1], 'Target was determined.');
};

exports['test dojo on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/dojo/1.8.3/dojo.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ember on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/emberjs/2.1.0/ember.min.js');
    assert.equal(target.path, localPaths.ember[1], 'Target was determined.');
};

exports['test jquery on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/jquery/1.11.1/jquery.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/jquery.ui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test mootools on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/mootools/1.4.5/mootools-core-nocompat.min.js');
    assert.equal(target.path, localPaths.mootools, 'Target was determined.');
};

exports['test swfobject on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/swfobject/2.2/swfobject.js');
    assert.equal(target.path, localPaths.swfobject, 'Target was determined.');
};

exports['test underscore on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/underscorejs/1.6.0/underscore-min.js');
    assert.equal(target.path, localPaths.underscore[2], 'Target was determined.');
};

exports['test webfont on jsdelivr'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('cdn.jsdelivr.net', '/webfontloader/1.5.18/webfontloader.js');
    assert.equal(target.path, localPaths.webfont[1], 'Target was determined.');
};

// Yandex CDN

exports['test angular on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/angularjs/1.2.19/angular.min.js');
    assert.equal(target.path, localPaths.angular, 'Target was determined.');
};

exports['test backbone on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/backbone/1.1.2/backbone-min.js');
    assert.equal(target.path, localPaths.backbone[1], 'Target was determined.');
};

exports['test dojo on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/dojo/1.8.3/dojo/dojo.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ext-core on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/ext-core/3.1.0/ext-core.min.js');
    assert.equal(target.path, localPaths.extCore, 'Target was determined.');
};

exports['test jquery on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/jquery/1.11.1/jquery.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/jquery-ui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test modernizr on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/modernizr/2.6.2/modernizr.min.js');
    assert.equal(target.path, localPaths.modernizr, 'Target was determined.');
};

exports['test prototype on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/prototype/1.6.1.0/prototype.min.js');
    assert.equal(target.path, localPaths.prototypeJS, 'Target was determined.');
};

exports['test scriptaculous on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/scriptaculous/1.9.0/scriptaculous.js');
    assert.equal(target.path, localPaths.scriptaculous, 'Target was determined.');
};

exports['test swfobject on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/swfobject/2.2/swfobject.min.js');
    assert.equal(target.path, localPaths.swfobject, 'Target was determined.');
};

exports['test underscore on yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yastatic.net', '/underscore/1.6.0/underscore-min.js');
    assert.equal(target.path, localPaths.underscore[2], 'Target was determined.');
};

exports['test angular on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/angularjs/1.2.19/angular.min.js');
    assert.equal(target.path, localPaths.angular, 'Target was determined.');
};

exports['test backbone on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/backbone/1.1.2/backbone-min.js');
    assert.equal(target.path, localPaths.backbone[1], 'Target was determined.');
};

exports['test dojo on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/dojo/1.8.3/dojo/dojo.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ext-core on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/ext-core/3.1.0/ext-core.min.js');
    assert.equal(target.path, localPaths.extCore, 'Target was determined.');
};

exports['test jquery on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/jquery/1.11.1/jquery.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/jquery-ui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test modernizr on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/modernizr/2.6.2/modernizr.min.js');
    assert.equal(target.path, localPaths.modernizr, 'Target was determined.');
};

exports['test prototype on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/prototype/1.6.1.0/prototype.min.js');
    assert.equal(target.path, localPaths.prototypeJS, 'Target was determined.');
};

exports['test scriptaculous on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/scriptaculous/1.9.0/scriptaculous.js');
    assert.equal(target.path, localPaths.scriptaculous, 'Target was determined.');
};

exports['test swfobject on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/swfobject/2.2/swfobject.min.js');
    assert.equal(target.path, localPaths.swfobject, 'Target was determined.');
};

exports['test underscore on old yandex cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('yandex.st', '/underscore/1.6.0/underscore-min.js');
    assert.equal(target.path, localPaths.underscore[2], 'Target was determined.');
};

// Baidu CDN

exports['test backbone on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/backbone/0.9.2/backbone-min.js');
    assert.equal(target.path, localPaths.backbone[0], 'Target was determined.');
};

exports['test dojo on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/dojo/1.8.3/dojo.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ext-core on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/ext-core/3.1.0/ext-core.js');
    assert.equal(target.path, localPaths.extCore, 'Target was determined.');
};

exports['test jquery on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/jquery/1.11.1/jquery.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/jqueryui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test mootools on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/mootools/1.4.5/mootools-yui-compressed.js');
    assert.equal(target.path, localPaths.mootools, 'Target was determined.');
};

exports['test prototype on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/prototype/1.6.1.0/prototype.js');
    assert.equal(target.path, localPaths.prototypeJS, 'Target was determined.');
};

exports['test scriptaculous on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/scriptaculous/1.9.0/scriptaculous.js');
    assert.equal(target.path, localPaths.scriptaculous, 'Target was determined.');
};

exports['test swfobject on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/swfobject/2.2/swfobject.js');
    assert.equal(target.path, localPaths.swfobject, 'Target was determined.');
};

exports['test underscore on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/underscore/1.3.3/underscore-min.js');
    assert.equal(target.path, localPaths.underscore[0], 'Target was determined.');
};

exports['test webfont on baidu cdn'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('libs.baidu.com', '/webfont/1.0.19/webfont.js');
    assert.equal(target.path, localPaths.webfont[0], 'Target was determined.');
};

// Sina Public Resources

exports['test angular on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/angular.js/angular-1.2.19/angular.min.js');
    assert.equal(target.path, localPaths.angular, 'Target was determined.');
};

exports['test backbone on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/backbone/0.9.2/backbone.min.js');
    assert.equal(target.path, localPaths.backbone[0], 'Target was determined.');
};

exports['test dojo on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/dojo/1.8.3/dojo.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ext-core on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/ext-core/3.1.0/ext-core.js');
    assert.equal(target.path, localPaths.extCore, 'Target was determined.');
};

exports['test jquery on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/jquery/1.11.1/jquery.js');
    assert.equal(target.path, localPaths.jQuery[1], 'Target was determined.');
};

exports['test jquery-ui on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/jquery-ui/1.10.2/jquery-ui.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test mootools on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/mootools/1.4.5/mootools.min.js');
    assert.equal(target.path, localPaths.mootools, 'Target was determined.');
};

exports['test prototype on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/prototype/1.6.1.0/prototype.min.js');
    assert.equal(target.path, localPaths.prototypeJS, 'Target was determined.');
};

exports['test scriptaculous on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/scriptaculous/1.9.0/scriptaculous.min.js');
    assert.equal(target.path, localPaths.scriptaculous, 'Target was determined.');
};

exports['test swfobject on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/swfobject/2.2/swfobject.js');
    assert.equal(target.path, localPaths.swfobject, 'Target was determined.');
};

exports['test underscore on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/underscore/1.4.4/underscore-min.js');
    assert.equal(target.path, localPaths.underscore[1], 'Target was determined.');
};

exports['test webfont on sina public resources'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('lib.sinaapp.com', '/js/webfont/1.0.19/webfont.js');
    assert.equal(target.path, localPaths.webfont[0], 'Target was determined.');
};

// UpYun Library

exports['test dojo on upyun library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('upcdn.b0.upaiyun.com', '/libs/dojo/dojo-1.8.3.min.js');
    assert.equal(target.path, localPaths.dojo, 'Target was determined.');
};

exports['test ember on upyun library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('upcdn.b0.upaiyun.com', '/libs/emberjs/emberjs-1.1.0.min.js');
    assert.equal(target.path, localPaths.ember[0], 'Target was determined.');
};

exports['test jquery on upyun library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('upcdn.b0.upaiyun.com', '/libs/jquery/jquery-1.10.2.min.js');
    assert.equal(target.path, localPaths.jQuery[0], 'Target was determined.');
};

exports['test jquery-ui on upyun library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('upcdn.b0.upaiyun.com', '/libs/jqueryui/jquery.ui-1.10.2.min.js');
    assert.equal(target.path, localPaths.jQueryUI, 'Target was determined.');
};

exports['test modernizr on upyun library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('upcdn.b0.upaiyun.com', '/libs/modernizr/modernizr-2.6.2.min.js');
    assert.equal(target.path, localPaths.modernizr, 'Target was determined.');
};

exports['test mootools on upyun library'] = function (assert) {
    var target = requestAnalyzer.getLocalTarget('upcdn.b0.upaiyun.com', '/libs/mootoolscore/mootools.core-1.4.5.min.js');
    assert.equal(target.path, localPaths.mootools, 'Target was determined.');
};

/**
 * Run Tests
 */

require("sdk/test").run(exports);
