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
 * Constants
 */

const WEB_PREFIX_VALUE = 'www.';
const WEB_PREFIX_LENGTH = WEB_PREFIX_VALUE.length;
const VALUE_SEPARATOR = ';';

/**
 * Private Methods
 */

options._determineScriptDirection = function (language) {

    let rightToLeftLanguages, scriptDirection;

    rightToLeftLanguages = ['ar', 'he'];

    if (rightToLeftLanguages.indexOf(language) !== -1) {
        scriptDirection = 'rtl';
    } else {
        scriptDirection = 'ltr';
    }

    return scriptDirection;
};

options._languageIsFullySupported = function (language) {

    let languageSupported, supportedLanguages;

    languageSupported = false;

    supportedLanguages = ['ar', 'bg', 'zh-CN', 'zh-TW', 'nl', 'en', 'et', 'fi',
        'fr', 'de', 'he', 'hu', 'is', 'id', 'pl', 'pt-PT', 'ro', 'es', 'tr'];

    for (let supportedLanguage of supportedLanguages) {

        if (language.search(supportedLanguage) !== -1) {
            languageSupported = true;
        }
    }

    return languageSupported;
};

options._getOptionElement = function (optionKey) {
    return document.querySelector('[data-option=' + optionKey + ']');
};

/**
 * Initializations
 */

document.addEventListener('DOMContentLoaded', function () {

    let i18nElements, scriptDirection, languageSupported, optionElements;

    i18nElements = document.querySelectorAll('[data-i18n-content]');
    scriptDirection = options._determineScriptDirection(navigator.language);
    document.body.setAttribute('dir', scriptDirection);

    languageSupported = options._languageIsFullySupported(navigator.language);

    if (languageSupported === false) {

        let localeNoticeElement = document.getElementById('notice-locale');
        localeNoticeElement.setAttribute('class', 'notice');
    }

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');
        i18nElement.innerText = chrome.i18n.getMessage(i18nMessageName);
    });

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
            domainWhitelist = domainWhitelist + domain + ';';
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
