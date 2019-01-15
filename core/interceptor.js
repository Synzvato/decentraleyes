/**
 * Interceptor
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2016-04-06
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Interceptor
 */

var interceptor = {};

/**
 * Public Methods
 */

interceptor.handleRequest = function (requestDetails, tabIdentifier, tab) {

    let validCandidate, tabDomain, targetDetails, targetPath;

    validCandidate = requestAnalyzer.isValidCandidate(requestDetails, tab);

    if (!validCandidate) {

        return {
            'cancel': false
        };
    }

    tabDomain = helpers.extractDomainFromUrl(tab.url, true);

    if (tabDomain === null) {
        tabDomain = Address.EXAMPLE;
    }

    if (requestDetails.type === WebRequestType.XHR) {

        if (tabDomain !== interceptor.xhrTestDomain) {
            return interceptor._handleMissingCandidate(requestDetails.url);
        }
    }

    if (interceptor.taintedDomains[tabDomain] || (/yandex\./).test(tabDomain)) {
        return interceptor._handleMissingCandidate(requestDetails.url, true);
    }

    targetDetails = requestAnalyzer.getLocalTarget(requestDetails);
    targetPath = targetDetails.path;

    if (!targetPath) {
        return interceptor._handleMissingCandidate(requestDetails.url);
    }

    if (!files[targetPath]) {
        return interceptor._handleMissingCandidate(requestDetails.url);
    }

    stateManager.requests[requestDetails.requestId] = {
        tabIdentifier, targetDetails
    };

    return {
        'redirectUrl': chrome.extension.getURL(targetPath + fileGuard.secret)
    };
};

/**
 * Private Methods
 */

interceptor._handleMissingCandidate = function (requestUrl, preserveUrl) {

    let requestUrlSegments;

    if (interceptor.blockMissing === true) {

        return {
            'cancel': true
        };
    }

    if (preserveUrl === true) {

        return {
            'cancel': false
        };
    }

    requestUrlSegments = new URL(requestUrl);

    if (requestUrlSegments.protocol === Address.HTTP) {

        requestUrlSegments.protocol = Address.HTTPS;
        requestUrl = requestUrlSegments.toString();

        return {
            'redirectUrl': requestUrl
        };

    } else {

        return {
            'cancel': false
        };
    }
};

interceptor._handleStorageChanged = function (changes) {

    if (Setting.XHR_TEST_DOMAIN in changes) {
        interceptor.xhrTestDomain = changes.xhrTestDomain.newValue;
    }

    if (Setting.BLOCK_MISSING in changes) {
        interceptor.blockMissing = changes.blockMissing.newValue;
    }
};

/**
 * Initializations
 */

// Temporary list of tainted domains.
interceptor.taintedDomains = {
    '10fastfingers.com': true,
    'blog.datawrapper.de': true,
    'bundleofholding.com': true,
    'cdnjs.com': true,
    'cellmapper.net': true,
    'code.world': true,
    'creativecommons.org': true,
    'docs.servicenow.com': true,
    'dropbox.com': true,
    'echo-news.co.uk': true,
    'epey.com': true,
    'evoice.com': true,
    'freebusy.io': true,
    'gazetadopovo.com.br': true,
    'gdt.oqlf.gouv.qc.ca': true,
    'glowing-bear.org': true,
    'ico.org.uk': true,
    'labdoor.com': true,
    'manualslib.com': true,
    'meslieux.paris.fr': true,
    'mgm.gov.tr': true,
    'minigames.mail.ru': true,
    'miniquadtestbench.com': true,
    'nhm.ac.uk': true,
    'opavote.com': true,
    'openweathermap.org': true,
    'poedb.tw': true,
    'qwertee.com': true,
    'regentgreymouth.co.nz': true,
    'report-uri.io': true,
    'scan.nextcloud.com': true,
    'scotthelme.co.uk': true,
    'securityheaders.com': true,
    'securityheaders.io': true,
    'somiibo.com': true,
    'stefansundin.github.io': true,
    'timescale.com': true,
    'transcend-info.com': true,
    'udacity.com': true,
    'yadi.sk': true,
    'yelp.com': true,
    'yourvotematters.co.uk': true
};

interceptor.amountInjected = 0;
interceptor.xhrTestDomain = Address.DECENTRALEYES;
interceptor.blockMissing = false;

interceptor.relatedSettings = [];

interceptor.relatedSettings.push(Setting.AMOUNT_INJECTED);
interceptor.relatedSettings.push(Setting.XHR_TEST_DOMAIN);
interceptor.relatedSettings.push(Setting.BLOCK_MISSING);

chrome.storage.local.get(interceptor.relatedSettings, function (items) {

    interceptor.amountInjected = items.amountInjected || 0;
    interceptor.xhrTestDomain = items.xhrTestDomain || Address.DECENTRALEYES;
    interceptor.blockMissing = items.blockMissing || false;
});

/**
 * Event Handlers
 */

chrome.storage.onChanged.addListener(interceptor._handleStorageChanged);
