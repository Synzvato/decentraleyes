/**
 * Request Analyzer
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2014-05-30
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Imports
 */

var preferences = require('sdk/simple-prefs').prefs;

/**
 * Resource version mappings.
 * @var {object} mappings
 */
var mappings = require('./mappings');

/**
 * Variables
 */

var whitelistedDomains = [];

/**
 * Initializations
 */

applyWhitelistPreference();

/**
 * Event Handlers
 */

require('sdk/simple-prefs').on('domainWhitelist', applyWhitelistPreference);


/**
 * Public Methods
 */

function isValidCandidate(httpChannel) {

    if (mappings[httpChannel.URI.host] === undefined) {
        return false;
    }

    var requestDomain = null;

    if (httpChannel.loadInfo && httpChannel.loadInfo.loadingDocument && httpChannel.loadInfo.loadingDocument.domain) {
        requestDomain = normalizeDomain(httpChannel.loadInfo.loadingDocument.domain);
    } else if (httpChannel.referrer && httpChannel.referrer.host) {
        requestDomain = normalizeDomain(httpChannel.referrer.host);
    }

    if (whitelistedDomains.length > 0 && requestDomain !== null) {

        for (let domain of whitelistedDomains) {

            if (domain === requestDomain) {

                // Remove referer header from request.
                httpChannel.setRequestHeader('Referer', null, false);
                return false;
            }
        }
    }

    return httpChannel.requestMethod === 'GET';
}

function getLocalTarget(channelHost, channelPath) {

    var basePath, hostMappings, resourceMappings, localTarget;

    hostMappings = mappings[channelHost];

    // Ignore mapping files.
    if (channelPath.indexOf('.min.js.map') > -1) {
        return false;
    }

    if (channelPath.indexOf('.min.map') > -1) {
        return false;
    }

    basePath = matchBasePath(hostMappings, channelPath);

    if (!basePath) {
        return false;
    }

    resourceMappings = hostMappings[basePath];
    localTarget = matchResourcePath(resourceMappings, basePath, channelPath);

    if (!localTarget) {
        return false;
    }

    return localTarget;
}

/**
 * Exports
 */

exports.isValidCandidate = isValidCandidate;
exports.getLocalTarget = getLocalTarget;

/**
 * Private Methods
 */

function matchBasePath(hostMappings, channelPath) {

    for (let basePath in hostMappings) {

        if (hostMappings.hasOwnProperty(basePath)) {

            if (channelPath.startsWith(basePath)) {
                return basePath;
            }
        }
    }

    return false;
}

function matchResourcePath(resourceMappings, basePath, channelPath) {

    var resourcePath, versionNumber, resourcePattern;

    resourcePath = channelPath.replace(basePath, '');

    versionNumber = resourcePath.match(/(?:\d{1,2}\.){1,3}\d{1,2}/);
    resourcePattern = resourcePath.replace(versionNumber, '{version}');

    for (let resourceMold in resourceMappings) {

        if (resourceMappings.hasOwnProperty(resourceMold)) {

            if (resourcePattern.startsWith(resourceMold)) {

                var localTarget = {
                    path: resourceMappings[resourceMold].path,
                    type: resourceMappings[resourceMold].type
                };

                // Fill in the appropriate version number.
                localTarget.path = localTarget.path.replace('{version}', versionNumber);

                return localTarget;
            }
        }
    }

    return false;
}

function normalizeDomain(domain) {

    domain = domain.toLowerCase().trim();

    if (domain.startsWith('www.')) {
        domain = domain.slice(4);
    }

    return domain;
}

function applyWhitelistPreference() {

    whitelistedDomains = [];

    //noinspection JSUnresolvedVariable
    preferences.domainWhitelist.split(';').forEach(function(domain, index) {
        whitelistedDomains[index] = normalizeDomain(domain);
    });
}
