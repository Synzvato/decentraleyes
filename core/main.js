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
        [Setting.SHOW_ICON_BADGE]: true,
        [Setting.BLOCK_MISSING]: false,
        [Setting.DISABLE_PREFETCH]: true,
        [Setting.STRIP_METADATA]: true,
        [Setting.WHITELISTED_DOMAINS]: {}
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

main._showReleaseNotes = function (details) {

    let location, previousVersion;

    location = chrome.extension.getURL('pages/welcome/welcome.html');

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL ||
        details.reason === chrome.runtime.OnInstalledReason.UPDATE) {

        previousVersion = details.previousVersion;

        if (previousVersion && previousVersion.charAt(0) === '2') {
            return; // Do not show release notes after minor updates.
        }

        if (details.temporary !== true) {

            chrome.storage.local.get({
                [Setting.SHOW_RELEASE_NOTES]: true
            }, function (options) {

                if (options.showReleaseNotes === true) {

                    chrome.tabs.create({
                        'url': location,
                        'active': false
                    });
                }
            });
        }
    }
};

/**
 * Initializations
 */

chrome.runtime.onInstalled.addListener(main._showReleaseNotes);
main._initializeOptions();

wrappers.setBadgeBackgroundColor({
    'color': [74, 130, 108, 255]
});
