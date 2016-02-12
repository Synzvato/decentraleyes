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
 * Retains data across Firefox restarts.
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
const HTML_DOCUMENT = Ci.nsIDOMHTMLDocument;
const SCRIPT_ELEMENT = Ci.nsIDOMHTMLScriptElement;
const REQUEST_ACCEPTATION = Ci.nsIContentPolicy.ACCEPT;

/**
 * Variables
 */

var storage = simpleStorage.storage;

/**
 * Initializations
 */

storage.taintedDomains = storage.taintedDomains || {};

/**
 * Load Watcher Class
 */

var LoadWatcher = new Class({

    extends: Unknown,
    interfaces: ['nsIContentPolicy'],
    get wrappedJSObject() { return this },

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

            } else if (node instanceof HTML_DOCUMENT) {

                if (node.defaultView && node.defaultView.frameElement) {

                    if (node.defaultView.frameElement.tagName === 'IFRAME') {

                        // Add corresponding origin domain to the list of tainted domains.
                        storage.taintedDomains[requestOrigin.host] = true;
                    }
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
