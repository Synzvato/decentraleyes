/**
 * Internal API Wrapper Module
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2017-12-03
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Wrappers
 */

var wrappers = {};

/**
 * Public Methods
 */

wrappers.setBadgeBackgroundColor = function (details) {

    if (chrome.browserAction.setBadgeBackgroundColor !== undefined) {
        chrome.browserAction.setBadgeBackgroundColor(details);
    }
};

wrappers.setBadgeText = function (details) {

    if (chrome.browserAction.setBadgeText !== undefined) {
        chrome.browserAction.setBadgeText(details);
    }
};

wrappers.setIcon = function (details) {

    if (chrome.browserAction.setIcon !== undefined) {
        chrome.browserAction.setIcon(details);
    }
};
