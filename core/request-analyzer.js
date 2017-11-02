/**
 * Request Analyzer
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2016-04-11
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Request Analyzer
 */

var requestAnalyzer = {};

/**
 * Public Methods
 */

requestAnalyzer.isValidCandidate = function (requestDetails, tabDetails) {

    let initiatorHost;

    try {
        initiatorHost = tabDetails.url.match(WEB_DOMAIN_EXPRESSION)[1];
    } catch (exception) {
        initiatorHost = 'example.org';
    }

    if (initiatorHost && requestAnalyzer.whitelistedDomains[requestAnalyzer._normalizeDomain(initiatorHost)]) {
        return false;
    }

    // Only requests of type GET can be valid candidates.
    return requestDetails.method === 'GET';
};

requestAnalyzer.getLocalTarget = function (requestDetails) {

    let destinationHost, destinationPath, hostMappings, basePath, resourceMappings;

    destinationHost = requestDetails.url.match(WEB_DOMAIN_EXPRESSION)[1];
    destinationPath = requestDetails.url.match(WEB_DOMAIN_EXPRESSION)[2];

    // Use the proper mappings for the targeted host.
    hostMappings = mappings[destinationHost];

    // Resource mapping files are never locally available.
    if (MAPPING_FILE_EXPRESSION.test(destinationPath)) {
        return false;
    }

    basePath = requestAnalyzer._matchBasePath(hostMappings, destinationPath);
    resourceMappings = hostMappings[basePath];

    if (!resourceMappings) {
        return false;
    }

    // Return either the local target's path or false.
    return requestAnalyzer._findLocalTarget(resourceMappings, basePath, destinationHost, destinationPath);
};

/**
 * Private Methods
 */

requestAnalyzer._matchBasePath = function (hostMappings, channelPath) {

    for (let basePath of Object.keys(hostMappings)) {

        if (channelPath.startsWith(basePath)) {
            return basePath;
        }
    }

    return false;
};

requestAnalyzer._findLocalTarget = function (resourceMappings, basePath, channelHost, channelPath) {

    let resourcePath, versionNumber, resourcePattern;

    resourcePath = channelPath.replace(basePath, '');

    versionNumber = resourcePath.match(VERSION_EXPRESSION);
    resourcePattern = resourcePath.replace(versionNumber, VERSION_PLACEHOLDER);

    for (let resourceMold of Object.keys(resourceMappings)) {

        if (resourcePattern.startsWith(resourceMold)) {

            let targetPath, version;

            targetPath = resourceMappings[resourceMold].path;
            targetPath = targetPath.replace(VERSION_PLACEHOLDER, versionNumber);

            version = versionNumber && versionNumber[0] || targetPath.match(VERSION_EXPRESSION);

            // Prepare and return a local target.
            return {
                'source': channelHost,
                'version': version,
                'path': targetPath
            };
        }
    }

    return false;
};

requestAnalyzer._applyWhitelistedDomains = function () {

    chrome.storage.local.get('whitelistedDomains', function (items) {
        requestAnalyzer.whitelistedDomains = items.whitelistedDomains || {};
    });
};

requestAnalyzer._normalizeDomain = function (domain) {

    domain = domain.toLowerCase().trim();

    if (domain.startsWith(WEB_PREFIX_VALUE)) {
        domain = domain.slice(WEB_PREFIX_LENGTH);
    }

    return domain;
};

/**
 * Initializations
 */

requestAnalyzer.whitelistedDomains = {};
requestAnalyzer._applyWhitelistedDomains();

/**
 * Event Handlers
 */

chrome.storage.onChanged.addListener(requestAnalyzer._applyWhitelistedDomains);
