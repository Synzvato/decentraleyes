/**
 * Load Watcher
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2016-02-04
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

var { Class } = require('sdk/core/heritage');
var { Unknown, Factory } = require('sdk/platform/xpcom');
var { Cc, Ci, Cu } = require('chrome');

var xpcom = require('sdk/platform/xpcom');

/**
 * Resource version mappings.
 * @var {object} mappings
 */
var mappings = require('./mappings');

/**
 * Retains data across application restarts.
 * @var {object} simpleStorage
 */
var simpleStorage = require('sdk/simple-storage');

//noinspection JSUnresolvedFunction
var categoryManager = Cc['@mozilla.org/categorymanager;1']
    .getService(Ci.nsICategoryManager);

/**
 * Constants
 */

const CONTRACT_ID = '@decentraleyes.org/load-watcher;1';
const SCRIPT_CONTENT_TYPE = Ci.nsIContentPolicy.TYPE_SCRIPT;
const SCRIPT_ELEMENT = Ci.nsIDOMHTMLScriptElement;
const REQUEST_ACCEPTATION = Ci.nsIContentPolicy.ACCEPT;

/**
 * Variables
 */

var storage = simpleStorage.storage;

/**
 * Tainted domains that are not automatically detectable.
 * @var {object} undetectableTaintedDomains
 */
var undetectableTaintedDomains = {

    'direct.yandex.com': true,
    'direct.yandex.ru': true,
    'disk.yandex.com': true,
    'disk.yandex.ru': true,
    'mail.yandex.com': true,
    'mail.yandex.ru': true,
    'minigames.mail.ru': true,
    'news.yandex.ru': true,
    'news.yandex.ua': true,
    'passport.twitch.tv': true,
    'taxi.yandex.com': true,
    'taxi.yandex.ru': true,
    'ya.ru': true,
    'yandex.com': true,
    'yandex.ru': true
};

/**
 * Initializations
 */

Object.extend = function (destination, source) {

    for (var property in source) {

        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }

    return destination;
};

storage.taintedDomains = storage.taintedDomains || {};
storage.taintedDomains = Object.extend(storage.taintedDomains, undetectableTaintedDomains);

/**
 * Load Watcher Class
 */

var LoadWatcher = new Class({

    extends: Unknown,
    interfaces: ['nsIContentPolicy'],
    get wrappedJSObject() {
        return this
    },

    register: function () {

        categoryManager.deleteCategoryEntry('content-policy', CONTRACT_ID, false);
        categoryManager.addCategoryEntry('content-policy', CONTRACT_ID, CONTRACT_ID, false, true);
    },

    shouldLoad: function (contentType, contentLocation, requestOrigin, node) {

        if (contentType == SCRIPT_CONTENT_TYPE && mappings[contentLocation.host]) {

            if (node instanceof SCRIPT_ELEMENT) {

                if (node.hasAttribute('crossorigin') || node.hasAttribute('integrity')) {

                    // Add corresponding origin domain to the list of tainted domains.
                    storage.taintedDomains[requestOrigin.host] = true;
                }
            }
        }

        // Accept the resource load request.
        return REQUEST_ACCEPTATION;
    }
});

/**
 * Load Watcher Factory
 */

var factory = Factory({

    contract: CONTRACT_ID,
    Component: LoadWatcher,
    unregister: false
});

/**
 * Unregister
 */

var unload = require('sdk/system/unload');

unload.when(function () {

    function trueUnregister() {

        categoryManager.deleteCategoryEntry('content-policy', CONTRACT_ID, false);

        try {
            xpcom.unregister(factory);
        } catch (exception) {
            Cu.reportError(exception);
        }
    }

    if ('dispatch' in Cu) {
        Cu.dispatch(trueUnregister, trueUnregister);
    } else {
        Cu.import('resource://gre/modules/Services.jsm');
        Services.tm.mainThread.dispatch(trueUnregister, 0);
    }
});

/**
 * Exports
 */

module.exports = LoadWatcher;
