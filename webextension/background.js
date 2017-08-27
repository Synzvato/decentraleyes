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

var amountInjected = null;
var pendingCount = 0;

/**
 * Initializations
 */

webextensionPort = browser.runtime.connect({name: 'webextension'});

/**
 * Event Handlers
 */

webextensionPort.onMessage.addListener((message) => {

    if (message.subject === 'migrate-preferences') {

        browser.storage.local.get(function (items) {

            // Covers storage API failures.
            if (items === null) {
                return;
            }

            for (let preference of Object.keys(message.content)) {

                // Makes sure no existing preferences are overwritten.
                if (!items.hasOwnProperty(preference)) {

                    browser.storage.local.set({
                        [preference]: message.content[preference]
                    });
                }
            }
        });
    }

    if (message.subject === 'register-injection') {

        if (amountInjected !== null  && !isNaN(amountInjected)) {

            ++amountInjected;
            browser.storage.local.set({amountInjected});
        }

        ++pendingCount;

        if (pendingCount > 1) {
            return;
        }

        chrome.storage.local.get({

            // The stored amount, or zero.
            amountInjected: 0

        }, function (items) {

            // Accounts for the fact that the storage API is asynchronous.
            amountInjected = (items && items.amountInjected || 0) + pendingCount;
            browser.storage.local.set({amountInjected});
        });

    }

    if (message.subject === 'update-preferences') {
        chrome.storage.local.set(message.content);
    }
});
