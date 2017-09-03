/**
 * Main Options Page
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
 * Constants
 */

const WEB_PREFIX_VALUE = 'www.';
const WEB_PREFIX_LENGTH = WEB_PREFIX_VALUE.length;
const VALUE_SEPARATOR = ';';

/**
 * Initializations
 */

document.addEventListener('DOMContentLoaded', function () {

    let i18nElements, blockMissingElement, domainWhitelistElement;

    i18nElements = document.querySelectorAll('[data-i18n-content]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');
        i18nElement.innerText = chrome.i18n.getMessage(i18nMessageName);
    });

    blockMissingElement = document.querySelector('[data-option=blockMissing]');
    domainWhitelistElement = document.querySelector('[data-option=domainWhitelist]');

    chrome.storage.local.get(['blockMissing', 'whitelistedDomains'], function (items) {

        let whitelistedDomains = items.whitelistedDomains || {};
        let domainWhitelist = '';

        Object.keys(whitelistedDomains).forEach(function (domain) {
            domainWhitelist = domainWhitelist + domain + ';';
        });

        domainWhitelist = domainWhitelist.slice(0, -1);

        blockMissingElement.checked = items.blockMissing || false;
        domainWhitelistElement.value = domainWhitelist || '';
    });

    let optionChangedHandler = function () {

        let whitelistedDomains = {};

        domainWhitelistElement.value.split(VALUE_SEPARATOR).forEach(function (domain) {
            whitelistedDomains[_normalizeDomain(domain)] = true;
        });

        chrome.storage.local.set({

            'blockMissing': blockMissingElement.checked,
            'whitelistedDomains': whitelistedDomains
        });
    };

    blockMissingElement.addEventListener('change', optionChangedHandler);
    domainWhitelistElement.addEventListener('keyup', optionChangedHandler);
});

/**
 * Private Methods
 */

function _normalizeDomain(domain) {

    domain = domain.toLowerCase().trim();

    if (domain.startsWith(WEB_PREFIX_VALUE)) {
        domain = domain.slice(WEB_PREFIX_LENGTH);
    }

    return domain;
}
