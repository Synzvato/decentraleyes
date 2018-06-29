/**
 * File Guard
 * Belongs to Decentraleyes.
 *
 * @see https://git.synz.io/Synzvato/decentraleyes/merge_requests/258
 *
 * @author      Thomas Rientjes
 * @since       2018-05-17
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * File Guard
 */

var fileGuard = {};

/**
 * Private Methods
 */

fileGuard._startListening = function () {

    let randomHexString = helpers.generateRandomHexString(24);
    fileGuard.secret = `?_=${randomHexString}`;

    chrome.webRequest.onBeforeRequest.addListener(
        fileGuard._verifyRequest,
        {'urls': [fileGuard.path + Address.ANY_PATH]},
        [WebRequest.BLOCKING]
    );
};

fileGuard._verifyRequest = function (requestDetails) {

    let redirectUrl = chrome.runtime.getURL(Address.ROOT_PATH);

    if (!requestDetails.url.endsWith(fileGuard.secret)) {
        return {redirectUrl};
    }
};

/**
 * Initializations
 */

fileGuard.path = chrome.runtime.getURL(Address.RESOURCE_PATH);
fileGuard.secret = '';

if (fileGuard.path.startsWith(Address.CHROME_EXTENSION)) {
    fileGuard._startListening();
}
