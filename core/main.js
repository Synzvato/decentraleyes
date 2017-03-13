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
 * Initializations
 */

chrome.privacy.network.networkPredictionEnabled.set({'value': false});

chrome.browserAction.setBadgeBackgroundColor({
    'color': [74, 130, 108, 255]
});
