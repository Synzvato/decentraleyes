/**
 * Main Popup Page
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
 * Popup
 */

var popup = {};

/**
 * Constants
 */

const WEB_DOMAIN_EXPRESSION = /:\/\/(.[^\/]+)(.*)/;
const WEB_PREFIX_VALUE = 'www.';
const WEB_PREFIX_LENGTH = WEB_PREFIX_VALUE.length;

/**
 * Private Methods
 */

popup._determineScriptDirection = function (language) {

    let rightToLeftLanguages, scriptDirection;

    rightToLeftLanguages = ['ar', 'he'];

    if (rightToLeftLanguages.indexOf(language) !== -1) {
        scriptDirection = 'rtl';
    } else {
        scriptDirection = 'ltr';
    }

    return scriptDirection;
};

/**
 * Initializations
 */

document.addEventListener('DOMContentLoaded', function () {

    let optionsButtonElement, optionsTitle, scriptDirection, i18nElements;

    optionsButtonElement = document.getElementById('options-button');
    optionsTitle = chrome.i18n.getMessage('optionsTitle');

    scriptDirection = popup._determineScriptDirection(navigator.language);

    optionsButtonElement.setAttribute('title', optionsTitle);
    optionsButtonElement.setAttribute('dir', scriptDirection);

    i18nElements = document.querySelectorAll('[data-i18n-content]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');

        i18nElement.innerText = chrome.i18n.getMessage(i18nMessageName);
        i18nElement.setAttribute('dir', scriptDirection);
    });

    chrome.storage.local.get('amountInjected', function (items) {

        let amountInjected = items.amountInjected || 0;
        document.getElementById('injection-counter').innerText = amountInjected;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

            browser.runtime.getBackgroundPage().then(function (backgroundPage) {

                if (backgroundPage === null) {
                    return;
                }

                popup.backgroundPage = backgroundPage;

                if (backgroundPage.main.operatingSystem === 'android') {

                    browser.tabs.getCurrent().then(function (tab) {

                        browser.tabs.update(tab.id, {
                            'active': true
                        });
                    });
                }

                let injections, injectionOverview, domain;

                injections = backgroundPage.stateManager.tabs[tabs[0].id].injections;
                injectionOverview = {};

                try {
                    domain = tabs[0].url.match(WEB_DOMAIN_EXPRESSION)[1];
                } catch (exception) {
                    domain = null;
                }

                if (domain !== null) {

                    let websiteContextElement, protectionToggleElement, domainIndicatorElement;

                    websiteContextElement = document.getElementById('website-context');
                    protectionToggleElement = document.getElementById('protection-toggle-button');
                    domainIndicatorElement = document.getElementById('domain-indicator');

                    if (domain.startsWith(WEB_PREFIX_VALUE)) {
                        domain = domain.slice(WEB_PREFIX_LENGTH);
                    }

                    domainIndicatorElement.innerText = domain;

                    if (!backgroundPage.requestAnalyzer.whitelistedDomains[domain]) {

                        protectionToggleElement.setAttribute('class', 'button button-toggle active');

                        let disableProtectionTitle = chrome.i18n.getMessage('disableProtectionTitle');
                        
                        protectionToggleElement.setAttribute('title', disableProtectionTitle);
                        protectionToggleElement.setAttribute('dir', scriptDirection);

                        protectionToggleElement.addEventListener('click', function () {

                            backgroundPage.stateManager.addDomainToWhitelist(domain).then(function () {

                                chrome.tabs.reload(tabs[0].id);

                                if (backgroundPage.main.operatingSystem === 'android') {

                                    return browser.tabs.getCurrent().then(function (tab) {
                                        browser.tabs.remove(tab.id);
                                    });
                                }

                                return window.close();
                            });
                        });

                    } else {

                        protectionToggleElement.setAttribute('class', 'button button-toggle');

                        let enableProtectionTitle = chrome.i18n.getMessage('enableProtectionTitle');
                        protectionToggleElement.setAttribute('title', enableProtectionTitle);

                        protectionToggleElement.addEventListener('click', function () {

                            backgroundPage.stateManager.deleteDomainFromWhitelist(domain).then(function () {

                                chrome.tabs.reload(tabs[0].id);

                                if (backgroundPage.main.operatingSystem === 'android') {

                                    return browser.tabs.getCurrent().then(function (tab) {
                                        browser.tabs.remove(tab.id);
                                    });
                                }

                                return window.close();
                            });
                        });
                    }

                    websiteContextElement.setAttribute('class', 'panel');
                }

                for (let injection in injections) {

                    injection = injections[injection];

                    let injectionSource = injection.source;
                    injectionOverview[injectionSource] = injectionOverview[injectionSource] || [];

                    injectionOverview[injectionSource].push({
                        'path': injection.path,
                        'version': injection.version,
                        'source': injection.source
                    });
                }

                let listElement = document.createElement('ul');
                listElement.setAttribute('class', 'list');

                for (let injectionSource in injectionOverview) {

                    let cdn, listItemElement, badgeElement, badgeTextNode, cdnName, cdnNameTextNode, subListElement;

                    cdn = injectionOverview[injectionSource];

                    listItemElement = document.createElement('li');
                    listItemElement.setAttribute('class', 'list-item');

                    badgeElement = document.createElement('span');
                    badgeElement.setAttribute('class', 'badge');

                    badgeTextNode = document.createTextNode(cdn.length);
                    badgeElement.appendChild(badgeTextNode);

                    switch (injectionSource) {

                    case 'ajax.googleapis.com':
                        cdnName = 'Google Hosted Libraries';
                        break;
                    case 'ajax.aspnetcdn.com':
                        cdnName = 'Microsoft Ajax CDN';
                        break;
                    case 'ajax.microsoft.com':
                        cdnName = 'Microsoft Ajax CDN [Deprecated]';
                        break;
                        case 'cdnjs.cloudflare.com':
                        cdnName = 'CDNJS (Cloudflare)';
                        break;
                    case 'code.jquery.com':
                        cdnName = 'jQuery CDN (MaxCDN)';
                        break;
                    case 'cdn.jsdelivr.net':
                        cdnName = 'jsDelivr (MaxCDN)';
                        break;
                    case 'yastatic.net':
                        cdnName = 'Yandex CDN';
                        break;
                    case 'yandex.st':
                        cdnName = 'Yandex CDN [Deprecated]';
                        break;
                    case 'libs.baidu.com':
                        cdnName = 'Baidu CDN';
                        break;
                    case 'lib.sinaapp.com':
                        cdnName = 'Sina Public Resources';
                        break;
                    case 'upcdn.b0.upaiyun.com':
                        cdnName = 'UpYun Library';
                        break;
                    }

                    cdnNameTextNode = document.createTextNode(cdnName);

                    listItemElement.appendChild(badgeElement);
                    listItemElement.appendChild(cdnNameTextNode);

                    listElement.appendChild(listItemElement);

                    subListElement = document.createElement('ul');
                    subListElement.setAttribute('class', 'sublist');

                    listElement.appendChild(subListElement);

                    for (let injection of cdn) {

                        let subListItemElement, resourcePathDetails, resourceFilename, resourceName,
                            resourceNameTextNode, sideNoteElement, sideNoteTextNode;

                        subListItemElement = document.createElement('li');
                        subListItemElement.setAttribute('class', 'sublist-item');

                        resourcePathDetails = injection.path.split('/');
                        resourceFilename = resourcePathDetails[resourcePathDetails.length - 1];

                        switch (resourceFilename) {

                        case 'angular.min.js.dec':
                            resourceName = 'AngularJS';
                            break;
                        case 'backbone-min.js.dec':
                            resourceName = 'Backbone.js';
                            break;
                        case 'dojo.js.dec':
                            resourceName = 'Dojo';
                            break;
                        case 'ember.min.js.dec':
                            resourceName = 'Ember.js';
                            break;
                        case 'ext-core.js.dec':
                            resourceName = 'Ext Core';
                            break;
                        case 'jquery.min.js.dec':
                            resourceName = 'jQuery';
                            break;
                        case 'jquery-ui.min.js.dec':
                            resourceName = 'jQuery UI';
                            break;
                        case 'modernizr.min.js.dec':
                            resourceName = 'Modernizr';
                            break;
                        case 'mootools-yui-compressed.js.dec':
                            resourceName = 'MooTools';
                            break;
                        case 'prototype.js.dec':
                            resourceName = 'Prototype';
                            break;
                        case 'scriptaculous.js.dec':
                            resourceName = 'Scriptaculous';
                            break;
                        case 'swfobject.js.dec':
                            resourceName = 'SWFObject';
                            break;
                        case 'underscore-min.js.dec':
                            resourceName = 'Underscore.js';
                            break;
                        case 'webfont.js.dec':
                            resourceName = 'Web Font Loader';
                            break;
                        }

                        resourceNameTextNode = document.createTextNode('- ' + resourceName);
                        subListItemElement.appendChild(resourceNameTextNode);

                        sideNoteElement = document.createElement('span');
                        sideNoteElement.setAttribute('class', 'side-note');

                        sideNoteTextNode = document.createTextNode(' v' + injection.version);

                        sideNoteElement.appendChild(sideNoteTextNode);
                        subListItemElement.appendChild(sideNoteElement);

                        subListElement.appendChild(subListItemElement);
                    }
                }

                if (Object.keys(injectionOverview).length > 0) {

                    let websiteContextElement = document.getElementById('website-context');
                    websiteContextElement.append(listElement);
                }
            });
        });
    });

    optionsButtonElement.addEventListener('mouseup', function () {

        if (popup.backgroundPage.main.operatingSystem === 'android') {

            return chrome.tabs.create({
                'url': chrome.extension.getURL('pages/options/options.html')
            });
        }

        chrome.runtime.openOptionsPage();
        return window.close();
    });

    document.getElementById('testing-utility-link').addEventListener('mouseup', function (event) {

        if (event.button === 0 || event.button === 1) {

            browser.tabs.create({
                'url': 'https://decentraleyes.org/test',
                'active': (event.button === 0)
            });
        }

        if (event.button === 0) {
            window.close();
        }
    });
});
