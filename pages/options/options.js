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
 * Options
 */

var options = {};

/**
 * Private Methods
 */

options._getOptionElement = function (optionKey) {
    return document.querySelector(`[data-option=${optionKey}]`);
};

function _normalizeDomain (domain) {

    domain = domain.toLowerCase().trim();

    if (domain.startsWith(WEB_PREFIX_VALUE)) {
        domain = domain.slice(WEB_PREFIX_LENGTH);
    }

    return domain;
}

/**
 * Initializations
 */

document.addEventListener('DOMContentLoaded', function () {

    let scriptDirection, languageSupported, optionElements;

    scriptDirection = helpers.determineScriptDirection(navigator.language);
    document.body.setAttribute('dir', scriptDirection);

    languageSupported = helpers.languageIsFullySupported(navigator.language);

    if (languageSupported === false) {

        let localeNoticeElement = document.getElementById('notice-locale');
        localeNoticeElement.setAttribute('class', 'notice');
    }

    helpers.insertI18nContentIntoDocument(document);

    optionElements = {
        'showIconBadge': options._getOptionElement('showIconBadge'),
        'blockMissing': options._getOptionElement('blockMissing'),
        'disablePrefetch': options._getOptionElement('disablePrefetch'),
        'stripMetadata': options._getOptionElement('stripMetadata'),
        'whitelistedDomains': options._getOptionElement('whitelistedDomains')
    };

    chrome.storage.local.get(Object.keys(optionElements), function (items) {

        let whitelistedDomains, domainWhitelist;

        whitelistedDomains = items.whitelistedDomains;
        domainWhitelist = '';

        Object.keys(whitelistedDomains).forEach(function (domain) {
            domainWhitelist = `${domainWhitelist}${domain};`;
        });

        domainWhitelist = domainWhitelist.slice(0, -1);
        domainWhitelist = domainWhitelist.replace(/^;+|;+$/g, '');

        optionElements.showIconBadge.checked = items.showIconBadge;
        optionElements.blockMissing.checked = items.blockMissing;
        optionElements.disablePrefetch.checked = items.disablePrefetch;
        optionElements.stripMetadata.checked = items.stripMetadata;
        optionElements.whitelistedDomains.value = domainWhitelist;
    });

    let optionChangedHandler = function ({target}) {

        let optionKey, optionType, optionValue;

        optionKey = target.getAttribute('data-option');
        optionType = target.getAttribute('type');

        switch (optionType) {
        case 'checkbox':
            optionValue = target.checked;
            break;
        default:
            optionValue = target.value;
        }

        if (optionKey === 'disablePrefetch') {

            if (optionValue === false) {

                // Restore default values of related preference values.
                chrome.privacy.network.networkPredictionEnabled.clear({});

            } else {

                chrome.privacy.network.networkPredictionEnabled.set({
                    'value': false
                });
            }
        }

        if (optionKey === 'whitelistedDomains') {

            let domainWhitelist = optionValue;

            optionValue = {};

            domainWhitelist.split(VALUE_SEPARATOR).forEach(function (domain) {
                optionValue[_normalizeDomain(domain)] = true;
            });
        }

        chrome.storage.local.set({
            [optionKey]: optionValue
        });
    };

    optionElements.showIconBadge.addEventListener('change', optionChangedHandler);
    optionElements.blockMissing.addEventListener('change', optionChangedHandler);
    optionElements.disablePrefetch.addEventListener('change', optionChangedHandler);
    optionElements.stripMetadata.addEventListener('change', optionChangedHandler);
    optionElements.whitelistedDomains.addEventListener('keyup', optionChangedHandler);
});
