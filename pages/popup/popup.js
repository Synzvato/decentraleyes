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
 * Initializations
 */

document.addEventListener('DOMContentLoaded', function () {

    let i18nElements, saveButtonElement, blockMissingElement, domainWhitelistElement;

    i18nElements = document.querySelectorAll('[data-i18n-content]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');
        i18nElement.innerHTML = chrome.i18n.getMessage(i18nMessageName);
    });

    chrome.storage.local.get('amountInjected', function (items) {

        let amountInjected = items.amountInjected || 0;
        document.getElementById('injection-counter').innerHTML = amountInjected;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

            chrome.runtime.getBackgroundPage(function (backgroundPage) {

                let injections, injectionOverview;

                injections = backgroundPage.stateManager.tabs[tabs[0].id].injections;
                injectionOverview = {};

                for (let injection in injections) {

                    let injectionSource, libraryName;

                    injection = injections[injection];
                    injectionSource = injection.source;

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
                    subListElement.setAttribute('class', 'sub-list');

                    listElement.appendChild(subListElement);

                    cdn.forEach(function (injection) {

                        let subListItemElement, resourcePathDetails, resourceFilename, resourceName,
                            resourceNameTextNode, sideNoteElement, sideNoteTextNode;

                        subListItemElement = document.createElement('li');
                        subListItemElement.setAttribute('class', 'sub-list-item');

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
                    });
                }

                if (Object.keys(injectionOverview).length > 0) {

                    let popupContentElement = document.getElementById('popup-content');
                    let injectionCounterElement = document.getElementById('injection-counter');

                    popupContentElement.insertBefore(listElement, injectionCounterElement);
                }
            });
        });
    });

    document.getElementById('options-button').addEventListener('click', function () {
        chrome.runtime.openOptionsPage();
    });
});
