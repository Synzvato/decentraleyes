/**
 * Data Handler
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

var { Cc, Ci } = require('chrome');
var self = require('sdk/self');
var fileIO = require("sdk/io/file");

//noinspection JSUnresolvedFunction
var ioService = Cc['@mozilla.org/network/io-service;1']
    .getService(Ci.nsIIOService);

/**
 * Absolute resource file paths.
 * @var {object} files
 */
var files = require('./files');

/**
 * Constants
 */

const DELIVERY_NOTICE = '/**\n * Local delivery by Decentraleyes (' + self.version + ').\n */\n\n';
const PATH_SEP		  = require('sdk/fs/path').sep;	

/**
 * Variables
 */

var resourceData = self.data;

/**
 * Public Methods
 */

function getRedirectionURI(targetPath, characterSet, type, userDir) {    
    var data, dataURI, redirectionURI;    
    var invalidationChar = false;        
    
    data = _loadUserResource(targetPath, userDir);   //First, attempt to load from User Resource Dir    
    if (data == "")    {        
        data = _loadResource(targetPath);  //After, check bundeled Resources        
        invalidationChar = true;    
    }    
    dataURI = _buildDataURI(type, characterSet, data, invalidationChar);    
    redirectionURI = ioService.newURI(dataURI, null, null);        
    return redirectionURI;
}

function _loadUserResource(targetPath, userDir){	
    if (!userDir || userDir == "") return "";	
    if (!userDir.endsWith("/") && !userDir.endsWith("\\"))		
        userDir += PATH_SEP;	
    var userTargetPath = userDir + targetPath.substring(0, targetPath.length-4);	
    userTargetPath = userTargetPath.replace(/\//g, PATH_SEP).replace(/\\/g, PATH_SEP);		
    var text = "";	
    try {		
        if (fileIO.exists(userTargetPath)) {			
            var file = fileIO.open(userTargetPath, "r");			
            if (!file.closed) {				
                text = file.read();				
                file.close();			
            }		
        }	
    }	catch (e) {}	
    return text;
}

/**
 * Exports
 */

exports.getRedirectionURI = getRedirectionURI;

/**
 * Private Methods
 */

function _loadResource(targetPath) {

    var resource;

    try {        
        resource = resourceData.load(targetPath);    
    }    
    catch (e) {        
        throw new Error('The requested resource is missing.');    
    }        
    return resource;
}

function _buildDataURI(type, characterSet, data, stripfirst) {

    var addNotice, dataURI;

    //noinspection JSUnresolvedVariable
    addNotice = require('sdk/simple-prefs').prefs.addNotice;
    dataURI = 'data:' + type + ';charset=' + characterSet + ',';

    // Remove the syntax invalidation character for bundeled ressources.    
    if (stripfirst)        
        data = data.substring(1);

    if (!addNotice) {
        dataURI = dataURI + encodeURIComponent(data);
    } else {
        dataURI = dataURI + encodeURIComponent(DELIVERY_NOTICE + data);
    }

    return dataURI;
}
