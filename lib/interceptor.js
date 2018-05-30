/**
 * Interceptor
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

var { Class } = require('sdk/core/heritage');
var { Unknown } = require('sdk/platform/xpcom');
var { Cc, Ci, Cr } = require('chrome');

var main = require('./main');

/**
 * Gets and sets add-on specific preferences.
 * @var {object} simplePreferences
 */
var simplePreferences = require('sdk/simple-prefs');

/**
 * Retains data across application restarts.
 * @var {object} simpleStorage
 */
var simpleStorage = require('sdk/simple-storage');

//noinspection JSUnresolvedFunction
var observerService = Cc['@mozilla.org/observer-service;1']
    .getService(Ci.nsIObserverService);

var requestAnalyzer = require('./request-analyzer');
var dataHandler = require('./data-handler');

/**
 * Variables
 */

var preferences = simplePreferences.prefs;
var storage = simpleStorage.storage;

/**
 * Interceptor Class
 */

var Interceptor = new Class({

    extends: Unknown,
    interfaces: ['nsIObserver'],
    topic: 'http-on-modify-request',

    register: function () {
        observerService.addObserver(this, this.topic, false);
    },

    unregister: function () {
        observerService.removeObserver(this, this.topic);
    },

    /**
     * Called whenever an HTTP request is made.
     * @param httpChannel
     */
    observe: function (httpChannel) {

        var validCandidate, target, characterSet, redirectionURI;

        // Enable runtime discovery.
        httpChannel.QueryInterface(Ci.nsIHttpChannel);

        // Determine the validity of the candidate.
        validCandidate = requestAnalyzer.isValidCandidate(httpChannel);

        if (!validCandidate) {
            return;
        }

        // Remove sensitive headers from the request.
        httpChannel.setRequestHeader('Referer', null, false);
        httpChannel.setRequestHeader('Origin', null, false);
        httpChannel.setRequestHeader('Cookie', null, false);

        // Convert the original request URI to a local target.
        target = requestAnalyzer.getLocalTarget(httpChannel.URI.host, httpChannel.URI.path);

        if (!target) {
            return this.handleMissingCandidate(httpChannel);
        }

        characterSet = httpChannel.URI.originCharset;

        // Fetch local data and create a redirection URI.
        try {
            redirectionURI = dataHandler.getRedirectionURI(target.path, characterSet, target.type);
        } catch (exception) {
            return this.handleMissingCandidate(httpChannel);
        }

        // Fix for reported edge-case issues with specific websites.
        var initiatorDomain =
            httpChannel.loadInfo && httpChannel.loadInfo.loadingDocument && httpChannel.loadInfo.loadingDocument.domain ||
            httpChannel.referrer && httpChannel.referrer.host;

        if (storage.taintedDomains[initiatorDomain] || /yandex\./.test(initiatorDomain)) {
            return this.handleMissingCandidate(httpChannel);
        }

        // Redirect the HTTP channel to the the local destination.
        httpChannel.redirectTo(redirectionURI);

        //noinspection JSUnresolvedVariable
        preferences.amountInjected++;
        main.broadcastInjection();
    },

    /**
     * Called when a valid candidate cannot be injected.
     * @param httpChannel
     */
    handleMissingCandidate: function (httpChannel) {

        //noinspection JSUnresolvedVariable
        if (preferences.blockMissing) {
            httpChannel.cancel(Cr.NS_ERROR_NOT_AVAILABLE);
        }
    }
});

/**
 * Exports
 */

module.exports = Interceptor;
