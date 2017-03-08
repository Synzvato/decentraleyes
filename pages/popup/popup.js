/**
 * Main Popup Page
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2016-08-09
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Initializations
 */

document.addEventListener('DOMContentLoaded', function () {

    let i18nElements, saveButtonElement, blockMissingElement, domainWhitelistElement;

    i18nElements = document.querySelectorAll('[data-i18n-content]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');
        i18nElement.innerHTML = chrome.i18n.getMessage(i18nMessageName);
    });

    chrome.storage.local.get('amountInjected', function (items) {

        let amountInjected = items.amountInjected || 0;
        document.getElementById('injection-counter').innerHTML = amountInjected;
    });

    document.getElementById('options-button').addEventListener('click', function () {
        chrome.runtime.openOptionsPage();
    });
});
