/**
 * State Manager
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2017-03-10
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * State Manager
 */

var stateManager = {};

/**
 * Constants
 */

const BLOCKED_BY_CLIENT = 'net::ERR_BLOCKED_BY_CLIENT';
const BLOCKING_ACTION = 'blocking';
const HOST_PREFIX = '*://';
const HOST_SUFFIX = '/*';
const JAVASCRIPT_REQUEST_TYPE = 'script';
const REQUEST_HEADERS = 'requestHeaders';
const XML_HTTP_REQUEST_TYPE = 'xmlhttprequest';

/**
 * Public Methods
 */

stateManager.registerInjection = function (tabIdentifier, injection) {

    let injectionIdentifier, registeredTab, injectionCount;

    injectionIdentifier = injection.source + injection.path + injection.version;
    registeredTab = stateManager.tabs[tabIdentifier];

    registeredTab.injections[injectionIdentifier] = injection;
    injectionCount = Object.keys(registeredTab.injections).length || 0;

    if (injectionCount > 0) {

        chrome.browserAction.setBadgeText({
            tabId: tabIdentifier,
            text: injectionCount.toString()
        });

    } else {

        chrome.browserAction.setBadgeText({
            tabId: tabIdentifier,
            text: ''
        });
    }

    if (isNaN(interceptor.amountInjected)) {

        chrome.storage.local.get('amountInjected', function (items) {

            interceptor.amountInjected = items.amountInjected;

            chrome.storage.local.set({
                'amountInjected': ++interceptor.amountInjected
            });
        });

    } else {

        chrome.storage.local.set({
            'amountInjected': ++interceptor.amountInjected
        });
    }
};

/**
 * Private Methods
 */

stateManager._createTab = function (tab) {

    let tabIdentifier, requestFilters;

    tabIdentifier = tab.id;

    stateManager.tabs[tabIdentifier] = {
        'injections': {}
    };

    requestFilters = {

        'tabId': tabIdentifier,
        'types': stateManager.validTypes,
        'urls': stateManager.validHosts
    };

    chrome.webRequest.onBeforeRequest.addListener(function (requestDetails) {
        return interceptor.handleRequest(requestDetails, tabIdentifier, tab);
    }, requestFilters, [BLOCKING_ACTION]);
};

stateManager._removeTab = function (tabIdentifier) {
    delete stateManager.tabs[tabIdentifier];
};

stateManager._updateTab = function (details) {

    let tabIdentifier, frameIdentifier;

    tabIdentifier = details.tabId;
    frameIdentifier = details.frameId;

    if (tabIdentifier === -1 || frameIdentifier !== 0) {
        return;
    }

    chrome.browserAction.setBadgeText({
        tabId: tabIdentifier,
        text: ''
    });

    if (stateManager.tabs[tabIdentifier]) {
        stateManager.tabs[tabIdentifier].injections = {};
    }
};

/**
 * Initializations
 */

stateManager.requests = {};
stateManager.tabs = {};

stateManager.validTypes = [

    JAVASCRIPT_REQUEST_TYPE,
    XML_HTTP_REQUEST_TYPE
];

stateManager.validHosts = [];

for (let mapping in mappings) {

    if (!mappings.hasOwnProperty(mapping)) {
        continue;
    }

    let supportedHost = HOST_PREFIX + mapping + HOST_SUFFIX;
    stateManager.validHosts.push(supportedHost);
}

chrome.tabs.query({}, function (tabs) {
    tabs.forEach(stateManager._createTab);
});

/**
 * Event Handlers
 */

chrome.tabs.onCreated.addListener(stateManager._createTab);
chrome.tabs.onRemoved.addListener(stateManager._removeTab);

chrome.webNavigation.onCommitted.addListener(stateManager._updateTab, {
    url: [{urlContains: ':'}]
});

chrome.webRequest.onErrorOccurred.addListener(function (requestDetails) {

    if (stateManager.requests[requestDetails.requestId]) {
        delete stateManager.requests[requestDetails.requestId];
    }

}, {'urls': ['*://*/*']});

chrome.webRequest.onBeforeRedirect.addListener(function (requestDetails) {

    let knownRequest = stateManager.requests[requestDetails.requestId];

    if (knownRequest) {

        stateManager.registerInjection(knownRequest.tabIdentifier, knownRequest.targetDetails);
        delete stateManager.requests[requestDetails.requestId];
    }

}, {'urls': ['*://*/*']});

chrome.webRequest.onBeforeSendHeaders.addListener(function (requestDetails) {

    for (let i = 0; i < requestDetails.requestHeaders.length; ++i) {

        if (requestDetails.requestHeaders[i].name === 'Origin') {
            requestDetails.requestHeaders.splice(i, 1);
        } else if (requestDetails.requestHeaders[i].name === 'Referer') {
            requestDetails.requestHeaders.splice(i, 1);
        }
    }

    return {requestHeaders: requestDetails.requestHeaders};

}, {urls: stateManager.validHosts}, [BLOCKING_ACTION, REQUEST_HEADERS]);
