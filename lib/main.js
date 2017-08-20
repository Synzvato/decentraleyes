/**
 * Entry Point
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

var webextension = require('sdk/webextension');
var preferences = require('sdk/simple-prefs').prefs;

var self = require('sdk/self');
var tabs = require("sdk/tabs");

var Interceptor = require('./interceptor');
var LoadWatcher = require('./load-watcher');

/**
 * Variables
 */

var webextensionPort = null;

/**
 * Initializations
 */

var interceptor = new Interceptor();
var loadWatcher = new LoadWatcher();

var featurelessVersions = {

    '1.3.7': true
};

/**
 * Main
 */

// Executed as soon as the add-on is loaded.
exports.main = function (options) {

    // Initialize the embedded WebExtension.
    webextension.startup().then(({ browser }) => {

        browser.runtime.onConnect.addListener(port => {

            webextensionPort = port;

            if (port.name === 'webextension') {

                port.postMessage({
                    'subject': 'migrate-preferences',
                    'content': {
                        'amountInjected': preferences['amountInjected'],
                        'blockMissing': preferences['blockMissing'],
                        'domainWhitelist': preferences['domainWhitelist'],
                        'showReleaseNotes': preferences['showReleaseNotes']
                    }
                });
            }
        });
    });

    // Initialize add-on state.
    interceptor.register();
    loadWatcher.register();

    // Display the release notes if desired.
    if (preferences.showReleaseNotes) {

        if (options.loadReason === 'install' || (options.loadReason === 'upgrade' && !featurelessVersions[self.version])) {

            if (preferences['sdk.baseURI']) {
                tabs.open(preferences['sdk.baseURI'] + 'static/release-notes.html');
            }
        }
    }
};

// Executed as soon as the add-on is unloaded.
exports.onUnload = function () {

    // Clean up add-on state.
    interceptor.unregister();
};

// Sends injection updates to the WebExtension.
exports.broadcastInjection = function () {

    if (typeof webextensionPort === 'object') {

        webextensionPort.postMessage({
            'subject': 'register-injection'
        });
    }
};
