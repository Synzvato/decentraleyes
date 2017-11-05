/**
 * Resource Audit Script
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2014-07-24
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Imports
 */

var fileSystem, crypto, https, sourceMappingURL;

fileSystem = require('fs');
crypto = require('crypto');
https = require('https');
process = require('process');


sourceMappingURL = require('source-map-url');

/**
 * Variables
 */

var localResourceLocation = '../resources';
var localResourceLocationLength = localResourceLocation.length;
var localResourcePaths = [];
var comparedResourceAmount = 0;
var resourceAmount = 0;

/**
 * Functions
 */

function _fetchLocalResourcePaths (folderPath) {

    fileSystem.readdirSync(folderPath).forEach(function (resourceName) {

        var resourcePath = `${folderPath}/${resourceName}`;
        var resourceStatistics = fileSystem.statSync(resourcePath);

        if (resourceStatistics && resourceStatistics.isDirectory()) {
            _fetchLocalResourcePaths(resourcePath);
        } else {
            localResourcePaths.push(resourcePath);
        }

    });

    return localResourcePaths;
}

function _getLocalResourceContents (fileLocation, callback) {

    fileSystem.exists(fileLocation, function (exists) {

        if (exists) {

            fileSystem.stat(fileLocation, function (error, statistics) {

                fileSystem.open(fileLocation, 'r', function (error, fileDescriptor) {

                    var buffer = new Buffer(statistics.size);

                    fileSystem.read(fileDescriptor, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {

                        var localFileContents = buffer.toString('utf8', 0, buffer.length);

                        fileSystem.close(fileDescriptor, function () {});
                        callback(localFileContents);
                    });
                });
            });
        }

    });
}

function _getRemoteResourceImpl(resourceURL, success, fallback) {
    https.get(resourceURL, function(response) {
        var resourceContents = '';
        
        response.on('data', function (chunk) {
            resourceContents += chunk;
        });

        response.on('end', function () {

            if (response.statusCode === 200) {

                success(resourceContents, resourceURL);

            } else {

                fallback();

            }

        });
    });
}

function _getRemoteResourceContentsFromCdns (remoteResourceRoute, callback) {

    _getRemoteResourceImpl(`https://ajax.googleapis.com/ajax/libs/${remoteResourceRoute}`, callback, function() {
        _getRemoteResourceImpl(`https://cdnjs.cloudflare.com/ajax/libs/${remoteResourceRoute}`, callback, function()  {

            var resourceRouteParts = remoteResourceRoute.split('/');
            var resourceName = resourceRouteParts[0];
            var resourceVersion = resourceRouteParts[1];
            var resourceFileName = resourceRouteParts[2];

            _getRemoteResourceImpl(`https://unpkg.com/${resourceName}@${resourceVersion}/umd/${resourceFileName}`, callback, function()  {
                throw `Unable to resolve remote resource for: ${remoteResourceRoute}`
            });
        });
    });
}

function _hashFileContents (fileContents) {

    var hash;

    hash = crypto.createHash('sha512');

    hash.setEncoding('hex');
    hash.write(fileContents);
    hash.end();

    return hash.read();
}

function _showCompletedMessage () {

    console.log();
    console.log('       *** FILE INTEGRITY CHECKS COMPLETED');
    console.log(`       *** ${resourceAmount}/${resourceAmount} RESOURCES WERE ANALYZED`);
    console.log();
}

function _incrementComparedResourceAmount () {

    comparedResourceAmount++;

    if (comparedResourceAmount === resourceAmount) {

        setTimeout(function () {
            _showCompletedMessage();
        }, 500);
    }
}

function _compareResources (localResourceContents, remoteResourceContents, URL) {

    var hasSourceMappingURL = sourceMappingURL.existsIn(remoteResourceContents);
    var sourceMappingNotice = '[ ] REMOTE RESOURCE HAD SOURCE MAPPING URL';

    if (hasSourceMappingURL) {
        remoteResourceContents = sourceMappingURL.removeFrom(remoteResourceContents);
        sourceMappingNotice = '[X] REMOTE RESOURCE HAD SOURCE MAPPING URL';
    }

    var localResourceHash = _hashFileContents(localResourceContents);
    var remoteResourceHash = _hashFileContents(remoteResourceContents);

    console.log(`RESOURCE HASH (SHA512): ${localResourceHash}`);
    console.log(`RESOURCE HASH (SHA512): ${remoteResourceHash}`);

    var fileHashesMatch = (localResourceHash === remoteResourceHash);

    if (!fileHashesMatch) {
        console.log(URL);
        console.log(remoteResourceContents);
        throw 'Error: Decentraleyes resource hash mismatch.';
    }

    console.log();
    console.log('[X] LOCAL AND REMOTE RESOURCE HASHES MATCH');
    console.log(sourceMappingNotice);

    _incrementComparedResourceAmount();
}

/**
 * Initializations
 */

_fetchLocalResourcePaths(localResourceLocation);
resourceAmount = localResourcePaths.length;

/**
 * Script
 */

localResourcePaths.filter(p => {
    let filterArg = process.argv.indexOf('--filter') + 1;
    if (filterArg <= 0 || filterArg >= process.argv.length) {
        return true;
    }
    return p.includes(process.argv[filterArg]);
}).forEach(function (resourcePath) {

    var resourceRoute = resourcePath.substr(localResourceLocationLength + 1);
    resourceRoute = resourceRoute.substring(0, resourceRoute.length - 4);

    _getLocalResourceContents(resourcePath, function (localResourceContents) {

        _getRemoteResourceContentsFromCdns(resourceRoute, function (remoteResourceContents, URL) {

            console.log();
            console.log(resourceRoute.toUpperCase());
            console.log();

            // Compare resource content hashes.
            _compareResources(localResourceContents, remoteResourceContents, URL);

            console.log();
            console.log('------------------------------------------');
        });
    });

});
