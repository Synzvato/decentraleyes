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
};

/**
 * Private Methods
 */

stateManager._createTab = function (tab) {

    let tabIdentifier = tab.id;

    stateManager.tabs[tabIdentifier] = {
        'injections': {}
    };

    chrome.webRequest.onBeforeRequest.addListener(function (requestDetails) {
        return interceptor.handleRequest(requestDetails, tabIdentifier, tab);
    }, { 'urls': ['*://*/*'], 'tabId': tabIdentifier }, ['blocking']);
};

stateManager._removeTab = function (tabIdentifier) {
    delete stateManager.tabs[tabIdentifier];
};

stateManager._updateTab = function (details) {

    let tabIdentifier = details.tabId;

    if (tabIdentifier !== -1) {

        if (stateManager.tabs[tabIdentifier]) {
            stateManager.tabs[tabIdentifier].injections = {};
        }
    }
};

/**
 * Initializations
 */

stateManager.tabs = {};

chrome.tabs.query({}, function (tabs) {
    tabs.forEach(stateManager._createTab);
});

/**
 * Event Handlers
 */

chrome.tabs.onCreated.addListener(stateManager._createTab);
chrome.tabs.onRemoved.addListener(stateManager._removeTab);

chrome.webRequest.onBeforeRequest.addListener(stateManager._updateTab, {
    urls: ['<all_urls>'], types: ['main_frame']
});
