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

var Interceptor = require('./interceptor');
var LoadWatcher = require('./load-watcher');

var preferences = require('sdk/simple-prefs').prefs;
var tabs = require("sdk/tabs");

/**
 * Main
 */

var interceptor = new Interceptor();
var loadWatcher = new LoadWatcher();

// Executed as soon as the add-on is loaded.
exports.main = function (options) {

    // Initialize add-on state.
    interceptor.register();
    loadWatcher.register();

    if (preferences.showReleaseNotes && (options.loadReason === 'install' || options.loadReason === 'upgrade')) {

        if (preferences['sdk.baseURI']) {
            tabs.open(preferences['sdk.baseURI'] + 'static/release-notes.html');
        }
    }
};

// Executed as soon as the add-on is unloaded.
exports.onUnload = function () {

    // Clean up add-on state.
    interceptor.unregister()
};
