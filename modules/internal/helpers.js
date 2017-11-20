/**
 * Internal Helper Module
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2017-10-26
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Helpers
 */

var helpers = {};

/**
 * Public Functions
 */

helpers.insertI18nContentIntoDocument = function (document) {

    let scriptDirection, i18nElements;

    scriptDirection = helpers.determineScriptDirection(navigator.language);
    i18nElements = document.querySelectorAll('[data-i18n-content]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');

        i18nElement.innerText = chrome.i18n.getMessage(i18nMessageName);
        i18nElement.setAttribute('dir', scriptDirection);
    });
};

helpers.insertI18nTitlesIntoDocument = function (document) {

    let scriptDirection, i18nElements;

    scriptDirection = helpers.determineScriptDirection(navigator.language);
    i18nElements = document.querySelectorAll('[data-i18n-title]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-title');

        i18nElement.setAttribute('title', chrome.i18n.getMessage(i18nMessageName));
        i18nElement.setAttribute('dir', scriptDirection);
    });
};

helpers.languageIsFullySupported = function (language) {

    let languageSupported, supportedLanguages;

    languageSupported = false;

    supportedLanguages = [
        'ar', 'bg', 'zh-CN', 'zh-TW', 'da', 'nl', 'en', 'et', 'fi', 'fr', 'de',
        'el', 'is', 'id', 'pl', 'pt-PT', 'ro', 'ru', 'es', 'sv', 'tr'
    ];

    for (let supportedLanguage of supportedLanguages) {

        if (language.search(supportedLanguage) !== -1) {
            languageSupported = true;
        }
    }

    return languageSupported;
};

helpers.determineCdnName = function (domainName) {

    switch (domainName) {

    case 'ajax.googleapis.com':
        return 'Google Hosted Libraries';
    case 'ajax.aspnetcdn.com':
        return 'Microsoft Ajax CDN';
    case 'ajax.microsoft.com':
        return 'Microsoft Ajax CDN [Deprecated]';
    case 'cdnjs.cloudflare.com':
        return 'CDNJS (Cloudflare)';
    case 'code.jquery.com':
        return 'jQuery CDN (MaxCDN)';
    case 'cdn.jsdelivr.net':
        return 'jsDelivr (MaxCDN)';
    case 'yastatic.net':
        return 'Yandex CDN';
    case 'yandex.st':
        return 'Yandex CDN [Deprecated]';
    case 'libs.baidu.com':
        return 'Baidu CDN';
    case 'lib.sinaapp.com':
        return 'Sina Public Resources';
    case 'upcdn.b0.upaiyun.com':
        return 'UpYun Library';
    default:
        return 'Unknown';
    }
};

helpers.determineResourceName = function (filename) {

    switch (filename) {

    case 'angular.min.js.dec':
        return 'AngularJS';
    case 'backbone-min.js.dec':
        return 'Backbone.js';
    case 'dojo.js.dec':
        return 'Dojo';
    case 'ember.min.js.dec':
        return 'Ember.js';
    case 'ext-core.js.dec':
        return 'Ext Core';
    case 'jquery.min.js.dec':
        return 'jQuery';
    case 'jquery-ui.min.js.dec':
        return 'jQuery UI';
    case 'modernizr.min.js.dec':
        return 'Modernizr';
    case 'mootools-yui-compressed.js.dec':
        return 'MooTools';
    case 'prototype.js.dec':
        return 'Prototype';
    case 'scriptaculous.js.dec':
        return 'Scriptaculous';
    case 'swfobject.js.dec':
        return 'SWFObject';
    case 'underscore-min.js.dec':
        return 'Underscore.js';
    case 'webfont.js.dec':
        return 'Web Font Loader';
    default:
        return 'Unknown';
    }
};

helpers.determineScriptDirection = function (language) {

    let rightToLeftLanguages, scriptDirection;

    rightToLeftLanguages = ['ar', 'he'];

    if (rightToLeftLanguages.indexOf(language) === -1) {
        scriptDirection = 'ltr';
    } else {
        scriptDirection = 'rtl';
    }

    return scriptDirection;
};

helpers.formatVersion = function (version) {

    if (version.indexOf('beta') === -1) {
        return version;
    } else {
        return 'BETA';
    }
};
