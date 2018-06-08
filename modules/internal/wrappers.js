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

// In firefox android, browser action shows as a menu entry instead of icon.
// Use the below 'setTitle' to show injected count in menu entry.

wrappers.setTitle = function (details){ 
     
    if (chrome.browserAction.setTitle !== undefined) {
        chrome.browserAction.setTitle(details); 
    }
}; 
