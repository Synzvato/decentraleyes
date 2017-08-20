/**
 * Embedded WebExtension - Background Script
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2017-08-18
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

var webextensionPort = {};
var amountInjected = 0;

/**
 * Initializations
 */

webextensionPort = browser.runtime.connect({name: 'webextension'});

/**
 * Event Handlers
 */

// browser.storage.local.remove('amountInjected');

webextensionPort.onMessage.addListener((message) => {

    if (message.subject === 'migrate-preferences') {

        browser.storage.local.get(function (items) {

            for (let preference of Object.keys(message.content)) {

                if (items.hasOwnProperty(preference)) {

                    if (preference === 'amountInjected') {
                        amountInjected = items.amountInjected;
                    }

                } else {

                    browser.storage.local.set({
                        [preference]: message.content[preference]
                    });

                    if (preference === 'amountInjected') {
                        amountInjected = message.content[preference];
                    }
                }
            }
        });
    }

    if (message.subject === 'register-injection') {

        if (isNaN(amountInjected)) {

            chrome.storage.local.get('amountInjected', function (items) {

                amountInjected = items.amountInjected;

                chrome.storage.local.set({
                    'amountInjected': ++amountInjected
                });
            });

        } else {

            chrome.storage.local.set({
                'amountInjected': ++amountInjected
            });
        }
    }
});
