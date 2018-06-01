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

/**
 * Resource version mappings.
 * @var {object} mappings
 */
var mappings = require('./mappings');

/**
 * Resource version shorthands.
 * @var {object} shorthands
 */
var shorthands = require('./shorthands');

/**
 * Gets and sets add-on specific preferences.
 * @var {object} simplePreferences
 */
var simplePreferences = require('sdk/simple-prefs');

/**
 * Constants
 */

const MAPPING_FILE_EXPRESSION = new RegExp('.map$', 'i');
const VERSION_EXPRESSION = /(?:\d{1,2}\.){1,3}\d{1,2}/;
const VERSION_PLACEHOLDER = '{version}';
const WEB_PREFIX_VALUE = 'www.';
const WEB_PREFIX_LENGTH = WEB_PREFIX_VALUE.length;
const VALUE_SEPARATOR = ';';

/**
 * Variables
 */

var preferences = simplePreferences.prefs;
var whitelistedDomains = {};

/**
 * Initializations
 */

_applyWhitelistPreference();

/**
 * Event Handlers
 */

simplePreferences.on('domainWhitelist', _applyWhitelistPreference);

/**
 * Public Methods
 */

exports.isValidCandidate = function (httpChannel) {

    var initiatorDomain;

    // See if the request is targeted at a Content Delivery Network.
    if (mappings[httpChannel.URI.host] === undefined) {
        return false;
    }

    // Attempt to determine the domain of the request initiator.
    initiatorDomain =
        httpChannel.loadInfo && httpChannel.loadInfo.loadingDocument && httpChannel.loadInfo.loadingDocument.domain ||
        httpChannel.referrer && httpChannel.referrer.host;

    // If the request initiator could be determined and is whitelisted.
    if (initiatorDomain && whitelistedDomains[_normalizeDomain(initiatorDomain)]) {

        // Remove sensitive headers from the request.
        httpChannel.setRequestHeader('Referer', null, false);
        httpChannel.setRequestHeader('Origin', null, false);
        httpChannel.setRequestHeader('Cookie', null, false);

        return false;
    }

    // Only requests of type GET can be valid candidates.
    return httpChannel.requestMethod === 'GET';
};

exports.getLocalTarget = function (channelHost, channelPath) {

    var hostMappings, basePath, resourceMappings;

    // Use the proper mappings for the targeted host.
    hostMappings = mappings[channelHost];

    // Resource mapping files are never locally available.
    if (MAPPING_FILE_EXPRESSION.test(channelPath)) {
        return false;
    }

    basePath = _matchBasePath(hostMappings, channelPath);
    resourceMappings = hostMappings[basePath];

    if (!resourceMappings) {
        return false;
    }

    // Return either the local target's path or false.
    return _findLocalTarget(resourceMappings, basePath, channelHost, channelPath);
};

/**
 * Private Methods
 */

function _matchBasePath (hostMappings, channelPath) {

    for (let basePath of Object.keys(hostMappings)) {

        if (channelPath.startsWith(basePath)) {
            return basePath;
        }
    }

    return false;
}

function _findLocalTarget (resourceMappings, basePath, channelHost, channelPath) {

    var resourcePath, versionNumber, resourcePattern;

    resourcePath = channelPath.replace(basePath, '');

    versionNumber = resourcePath.match(VERSION_EXPRESSION);
    resourcePattern = resourcePath.replace(versionNumber, VERSION_PLACEHOLDER);

    // Determine if the resource path has a static mapping.
    if (resourceMappings[resourcePath]) {

        // Prepare and return a local target.
        return {
            'path': resourceMappings[resourcePath].path,
            'type': resourceMappings[resourcePath].type
        };
    }

    // Determine if the resource path fits into a resource mold.
    for (let resourceMold of Object.keys(resourceMappings)) {

        if (resourcePattern.startsWith(resourceMold)) {

            let targetPath, targetType, hostShorthands;

            targetPath = resourceMappings[resourceMold].path;
            targetPath = targetPath.replace(VERSION_PLACEHOLDER, versionNumber);
            targetType = resourceMappings[resourceMold].type;

            hostShorthands = shorthands[channelHost];

            if (hostShorthands && hostShorthands[targetPath]) {

                let shorthand = hostShorthands[targetPath];

                targetPath = shorthand.path;
                targetType = shorthand.type;
            }

            // Prepare and return a local target.
            return {
                'path': targetPath,
                'type': targetType
            };
        }
    }

    return false;
}

function _normalizeDomain (domain) {

    domain = domain.toLowerCase().trim();

    if (domain.startsWith(WEB_PREFIX_VALUE)) {
        domain = domain.slice(WEB_PREFIX_LENGTH);
    }

    return domain;
}

function _applyWhitelistPreference () {

    whitelistedDomains = {};

    //noinspection JSUnresolvedVariable
    preferences.domainWhitelist.split(VALUE_SEPARATOR).forEach(function (domain) {
        whitelistedDomains[_normalizeDomain(domain)] = true;
    });
}
