/**
 * Interceptor
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2016-04-06
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Variables
 */

var interceptor = {};

/**
 * Public Methods
 */

interceptor.register = function () {

    chrome.tabs.onUpdated.addListener(function (tabIdentifier, changeInformation, tabDetails) {

        if (changeInformation.status === 'loading') {

            chrome.webRequest.onBeforeRequest.addListener(function (requestDetails) {
                return interceptor._handleRequest(requestDetails, tabIdentifier, tabDetails);
            }, { 'urls': ['*://*/*'], 'tabId': tabIdentifier }, ['blocking']);
        }
    });
};

/**
 * Private Methods
 */

interceptor._handleRequest = function (requestDetails, tabIdentifier, tabDetails) {

    let validCandidate, targetPath;

    validCandidate = requestAnalyzer.isValidCandidate(requestDetails, tabDetails);

    if (!validCandidate) {

        return {
            'cancel': false
        };
    }

    targetPath = requestAnalyzer.getLocalTarget(requestDetails);

    if (!targetPath) {
        return interceptor._handleMissingCandidate();
    }

    if (!files[targetPath]) {
        return interceptor._handleMissingCandidate();
    }

    chrome.storage.local.get('amountInjected', function (items) {

        let amountInjected;

        amountInjected = items.amountInjected || 0;

        chrome.storage.local.set({
            'amountInjected': (parseInt(amountInjected) + 1)
        });
    });

    return {
        'redirectUrl': chrome.extension.getURL(targetPath)
    };
};

interceptor._handleMissingCandidate = function () {

    return {
        'cancel': interceptor.blockMissing
    };
};

interceptor._applyBlockMissingPreference = function () {

    chrome.storage.local.get('blockMissing', function (items) {
        interceptor.blockMissing = items.blockMissing || false;
    });
};

/**
 * Initializations
 */

interceptor.blockMissing = false;
interceptor._applyBlockMissingPreference();

/**
 * Event Handlers
 */

chrome.storage.onChanged.addListener(interceptor._applyBlockMissingPreference);
