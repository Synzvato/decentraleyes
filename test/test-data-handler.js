'use strict';

/**
 * Imports
 */

var dataHandler = require('../lib/data-handler');

/**
 * Get Redirection URI Tests
 */

exports['test get redirection uri for existing file'] = function (assert) {

    var result = dataHandler.getRedirectionURI(
        'resources/jquery/2.1.4/jquery.min.js.dec', 'UTF-8', 'application/javascript'
    );

    assert.ok(typeof result === 'object', 'Existing file was handled succesfully.');
};

exports['test get redirection uri for non-existing file'] = function (assert) {

    assert.throws(function () {

        dataHandler.getRedirectionURI('resources/non-existing/0.5.7/non-existing.js.dec',
            'UTF-8', 'application/javascript');

    }, Error, 'Non-existing file was handled succesfully.');
};

/**
 * Run Tests
 */

require('sdk/test').run(exports);
