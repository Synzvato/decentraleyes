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
 * Constants
 */

const MAPPING_FILE_EXPRESSION = new RegExp('\.map$', 'i');
const VERSION_EXPRESSION = /(?:\d{1,2}\.){1,3}\d{1,2}/;
const VERSION_PLACEHOLDER = '{version}';
const WEB_DOMAIN_EXPRESSION = /:\/\/(.[^\/]+)(.*)/;
const WEB_PREFIX_VALUE = 'www.';
const WEB_PREFIX_LENGTH = WEB_PREFIX_VALUE.length;
const VALUE_SEPARATOR = ';';

/**
 * Public Methods
 */

requestAnalyzer.isValidCandidate = function (requestDetails, tabDetails) {

    let destinationHost, initiatorHost;

    destinationHost = requestDetails.url.match(WEB_DOMAIN_EXPRESSION)[1];

    // See if the request is targeted at a Content Delivery Network.
    if (mappings[destinationHost] === undefined) {
        return false;
    }

    initiatorHost = tabDetails.url.match(WEB_DOMAIN_EXPRESSION)[1];

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

    var resourcePath, versionNumber, resourcePattern;

    resourcePath = channelPath.replace(basePath, '');

    versionNumber = resourcePath.match(VERSION_EXPRESSION);
    resourcePattern = resourcePath.replace(versionNumber, VERSION_PLACEHOLDER);

    for (let resourceMold of Object.keys(resourceMappings)) {

        if (resourcePattern.startsWith(resourceMold)) {

            let targetPath, localPath;

            targetPath = resourceMappings[resourceMold].path;
            targetPath = targetPath.replace(VERSION_PLACEHOLDER, versionNumber);

            // Prepare and return a local target.
            return {
                source: channelHost,
                version: versionNumber[0],
                path: targetPath
            };
        }
    }

    return false;
};

requestAnalyzer._applyWhitelistedDomains = function () {

    //noinspection JSUnresolvedVariable
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
