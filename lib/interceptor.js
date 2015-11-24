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

var observerService = Cc['@mozilla.org/observer-service;1']
.getService(Ci.nsIObserverService);

var requestAnalyzer = require('./request-analyzer');
var dataHandler = require('./data-handler');

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

    observe: function (httpChannel) {

        var validCandidate, target, characterSet, redirectionURI;

        // Enable runtime discovery.
        httpChannel.QueryInterface(Ci.nsIHttpChannel);

        // Determine the validity of the candidate.
        validCandidate = requestAnalyzer.isValidCandidate(httpChannel);
        if (!validCandidate) { return; }

        // Remove referer header from request.
        httpChannel.setRequestHeader('Referer', null, false);

        // Convert the original request URI to a local target.
        target = requestAnalyzer.getLocalTarget(httpChannel.URI.host, httpChannel.URI.path); 
        
        if (!target) {
            this.handleMissingCandidate(httpChannel);
            return;
        }

        characterSet = httpChannel.URI.originCharset;

        try { // Fetch local data and create a redirection URI.
            redirectionURI = dataHandler.getRedirectionURI(target.path, characterSet, target.type);
        } 
        catch (exception) {
            this.handleMissingCandidate(httpChannel);
            return;
        }
        
        httpChannel.redirectTo(redirectionURI);
    },

    handleMissingCandidate: function (httpChannel) {

        var blockMissing = require('sdk/simple-prefs').prefs.blockMissing;

        if (blockMissing) {
            httpChannel.cancel(Cr.NS_ERROR_NOT_AVAILABLE);
        }
    }
});

/**
 * Exports
 */

module.exports = Interceptor;
