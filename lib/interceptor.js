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

//noinspection JSUnresolvedFunction
var observerService = Cc['@mozilla.org/observer-service;1']
    .getService(Ci.nsIObserverService);

var preferences = require('sdk/simple-prefs').prefs;

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

        if (!validCandidate) {
            return;
        }

        // Remove referer header from request.
        httpChannel.setRequestHeader('Referer', null, false);

        // Temporary fix for reported issues with the Play Store website.
        // Temporary fix for reported issues with the Report URI website.
        var requestDomain = null;

        if (httpChannel.loadInfo && httpChannel.loadInfo.loadingDocument && httpChannel.loadInfo.loadingDocument.domain) {
            requestDomain = httpChannel.loadInfo.loadingDocument.domain;
        } else if (httpChannel.referrer && httpChannel.referrer.host) {
            requestDomain = httpChannel.referrer.host;
        }

        if (requestDomain === 'play.google.com' || requestDomain === 'report-uri.io') {
            this.handleMissingCandidate(httpChannel);
            return;
        }

        // Convert the original request URI to a local target.
        target = requestAnalyzer.getLocalTarget(httpChannel.URI.host, httpChannel.URI.path);

        if (!target) {
            this.handleMissingCandidate(httpChannel);
            return;
        }

        characterSet = httpChannel.URI.originCharset;

        // Fetch local data and create a redirection URI.
        try {
            redirectionURI = dataHandler.getRedirectionURI(target.path, characterSet, target.type);
        } catch (exception) {
            this.handleMissingCandidate(httpChannel);
            return;
        }

        httpChannel.redirectTo(redirectionURI);

        //noinspection JSUnresolvedVariable
        preferences.amountInjected++;
    },

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
