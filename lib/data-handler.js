/**
 * Data Handler
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2014-05-30
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Imports
 */

var { Cc, Ci } = require('chrome');

var self = require('sdk/self');
var resourceData = self.data;
var version = self.version;

//noinspection JSUnresolvedFunction
var ioService = Cc['@mozilla.org/network/io-service;1']
    .getService(Ci.nsIIOService);

/**
 * Absolute resource file paths.
 * @var {object} files
 */
var files = require('./files');

/**
 * Public Methods
 */

function getRedirectionURI(targetPath, characterSet, type) {

    var data, dataURI, redirectionURI;

    data = loadResource(targetPath);
    dataURI = buildDataURI(type, characterSet, data);
    redirectionURI = ioService.newURI(dataURI, null, null);

    return redirectionURI;
}

/**
 * Exports
 */

exports.getRedirectionURI = getRedirectionURI;

/**
 * Private Methods
 */

function loadResource(targetPath) {

    var resource;

    // Find the result inside a static path index.
    if (files.indexOf(targetPath) == -1) {
        throw 'The requested resource is missing.';
    }

    // Attempt to load resource contents.
    try {
        resource = resourceData.load(targetPath);
    } catch (exception) {
        throw exception;
    }

    return resource;
}

function buildDataURI(type, characterSet, data) {

    var addNotice, dataURI, notice;

    //noinspection JSUnresolvedVariable
    addNotice = require('sdk/simple-prefs').prefs.addNotice;

    dataURI = 'data:' + type + ';charset=' + characterSet + ',';
    notice = '/**\n * Local delivery by Decentraleyes (' + version + ').\n */\n\n';

    if (!addNotice) {
        dataURI = dataURI + encodeURIComponent(data);
    } else {
        dataURI = dataURI + encodeURIComponent(notice + data);
    }

    return dataURI;
}
