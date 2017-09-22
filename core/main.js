/**
 * Entry Point
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2016-04-04
 * @license     MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Main
 */

var main = {};

/**
 * Private Methods
 */

main._initializeOptions = function () {

    let optionDefaults = {
        'showIconBadge': true,
        'blockMissing': false,
        'disablePrefetch': true,
        'stripMetadata': true,
        'whitelistedDomains': {}
    };

    chrome.storage.local.get(optionDefaults, function (options) {

        if (options === null) {
            options = optionDefaults;
        }

        if (options.disablePrefetch !== false) {

            chrome.privacy.network.networkPredictionEnabled.set({
                'value': false
            });
        }

        chrome.storage.local.set(options);
    });
};

/**
 * Initializations
 */

main._initializeOptions();

chrome.runtime.getPlatformInfo(function (information) {
    main.operatingSystem = information.os;
});

if (typeof chrome.browserAction.setBadgeBackgroundColor !== 'function') {

    chrome.browserAction.setBadgeBackgroundColor = function () {};
    chrome.browserAction.setBadgeText = function () {};

    chrome.browserAction.onClicked.addListener(function () {

        chrome.tabs.create({
            'url': chrome.extension.getURL('pages/popup/popup.html'),
            'active': false
        });
    });
}

chrome.browserAction.setBadgeBackgroundColor({
    'color': [74, 130, 108, 255]
});
