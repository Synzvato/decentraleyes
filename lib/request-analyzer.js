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

var mappings = require('./mappings');

/**
 * Public Methods
 */

function isValidCandidate (httpChannel) {

	if (mappings[httpChannel.URI.host] === undefined) { return false; }
	if (httpChannel.requestMethod != 'GET') { return false; }
	
	return true;
}

function getLocalTarget (channelHost, channelPath) {

	var basePath, hostMappings, resourceMappings, localTarget;
	hostMappings = mappings[channelHost];

	// Ignore mapping files.
	if (channelPath.indexOf('.min.js.map') > -1) { return false; }
	if (channelPath.indexOf('.min.map') > -1) { return false; }

	basePath = matchBasePath(hostMappings, channelPath);
	if (!basePath) { return false; }

	resourceMappings = hostMappings[basePath];
	localTarget = matchResourcePath(resourceMappings, basePath, channelPath);
	if (!localTarget) { return false; }

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

function matchBasePath (hostMappings, channelPath) {

	for (var basePath in hostMappings) {
		
		if (channelPath.indexOf(basePath) === 0) {
			return basePath;
		}
	}

	return false;
}

function matchResourcePath(resourceMappings, basePath, channelPath) {

	var resourcePath, versionNumber, resourcePattern;

	resourcePath = channelPath.replace(basePath, '');

	versionNumber = resourcePath.match(/(?:\d{1,2}\.){1,3}\d{1,2}/);
	resourcePattern = resourcePath.replace(versionNumber, '{version}');

	for (var resourceMold in resourceMappings) {

		if (resourcePattern.indexOf(resourceMold) === 0) {

			var localTarget = {
				path: resourceMappings[resourceMold].path,
				type: resourceMappings[resourceMold].type,
			};

			// Fill in the appropriate version number.
			localTarget.path = localTarget.path.replace('{version}', versionNumber);
			
			return localTarget;
		}
	}

	return false;
}
