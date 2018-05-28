/**
 * Messenger
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2018-05-28
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Messenger
 */

var messenger = {};

/**
 * Private Methods
 */

messenger._handleMessageReceived = function (message, sender, sendResponse) {

    let topic, value;

    topic = message.topic;
    value = message.value;

    if (topic === 'tab:fetch-injections') {

        sendResponse({'value': stateManager.tabs[value].injections});
        return MessageResponse.SYNCHRONOUS;
    }

    if (topic === 'domain:fetch-is-whitelisted') {

        let whitelistRecord = requestAnalyzer.whitelistedDomains[value];
        sendResponse({'value': Boolean(whitelistRecord)});

        return MessageResponse.SYNCHRONOUS;
    }

    if (topic === 'whitelist:add-domain') {

        stateManager.addDomainToWhitelist(value).then(function () {
            sendResponse({'value': true});
        });

        return MessageResponse.ASYNCHRONOUS;
    }

    if (topic === 'whitelist:remove-domain') {

        stateManager.removeDomainFromWhitelist(value).then(function () {
            sendResponse({'value': true});
        });

        return MessageResponse.ASYNCHRONOUS;
    }
};

/**
 * Event Handlers
 */

chrome.runtime.onMessage.addListener(messenger._handleMessageReceived);
