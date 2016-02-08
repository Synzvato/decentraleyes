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

//noinspection JSUnresolvedFunction
var ioService = Cc['@mozilla.org/network/io-service;1']
    .getService(Ci.nsIIOService);

/**
 * Absolute resource file paths.
 * @var {object} files
 */
var files = require('./files');

/**
 * Constants
 */

const DELIVERY_NOTICE = '/**\n * Local delivery by Decentraleyes (' + self.version + ').\n */\n\n';

/**
 * Variables
 */

var resourceData = self.data;

/**
 * Public Methods
 */

function getRedirectionURI(targetPath, characterSet, type) {

    var data, dataURI, redirectionURI;

    data = _loadResource(targetPath);
    dataURI = _buildDataURI(type, characterSet, data);
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

function _loadResource(targetPath) {

    var resource;

    // Find the result inside a static path index.
    if (!files[targetPath]) {
        throw new Error('The requested resource is missing.');
    }

    // Attempt to load resource contents.
    return resource = resourceData.load(targetPath);
}

function _buildDataURI(type, characterSet, data) {

    var addNotice, dataURI;

    //noinspection JSUnresolvedVariable
    addNotice = require('sdk/simple-prefs').prefs.addNotice;
    dataURI = 'data:' + type + ';charset=' + characterSet + ',';

    if (!addNotice) {
        dataURI = dataURI + encodeURIComponent(data);
    } else {
        dataURI = dataURI + encodeURIComponent(DELIVERY_NOTICE + data);
    }

    return dataURI;
}
