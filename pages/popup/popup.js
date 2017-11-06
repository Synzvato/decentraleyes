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
 * Initializations
 */

document.addEventListener('DOMContentLoaded', function () {

    let version, optionsButtonElement, scriptDirection;

    version = helpers.formatVersion(browser.runtime.getManifest().version);
    document.getElementById('version-label').innerText = version;

    scriptDirection = helpers.determineScriptDirection(navigator.language);
    optionsButtonElement = document.getElementById('options-button');

    helpers.insertI18nContentIntoDocument(document);
    helpers.insertI18nTitlesIntoDocument(document);

    chrome.storage.local.get('amountInjected', function (items) {

        let amountInjected = items.amountInjected || 0;
        document.getElementById('injection-counter').innerText = amountInjected;

        chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {

            chrome.runtime.getBackgroundPage(function (backgroundPage) {

                if (backgroundPage === null) {
                    return;
                }

                popup.backgroundPage = backgroundPage;

                if (backgroundPage.main.operatingSystem === chrome.runtime.PlatformOs.ANDROID) {

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
                    domain = tabs[0].url.match(Address.DOMAIN_EXPRESSION)[1];
                } catch (exception) {
                    domain = null;
                }

                if (domain !== null) {

                    let websiteContextElement, protectionToggleElement, domainIndicatorElement;

                    websiteContextElement = document.getElementById('website-context');
                    protectionToggleElement = document.getElementById('protection-toggle-button');
                    domainIndicatorElement = document.getElementById('domain-indicator');

                    if (domain.startsWith(Address.WWW_PREFIX)) {
                        domain = domain.slice(Address.WWW_PREFIX_LENGTH);
                    }

                    domainIndicatorElement.innerText = domain;

                    if (backgroundPage.requestAnalyzer.whitelistedDomains[domain]) {

                        protectionToggleElement.setAttribute('class', 'button button-toggle');

                        let enableProtectionTitle = chrome.i18n.getMessage('enableProtectionTitle');
                        protectionToggleElement.setAttribute('title', enableProtectionTitle);

                        protectionToggleElement.addEventListener('click', function () {

                            backgroundPage.stateManager.deleteDomainFromWhitelist(domain).then(function () {

                                chrome.tabs.reload(tabs[0].id);

                                if (backgroundPage.main.operatingSystem === chrome.runtime.PlatformOs.ANDROID) {

                                    return browser.tabs.getCurrent().then(function (tab) {
                                        browser.tabs.remove(tab.id);
                                    });
                                }

                                return window.close();
                            });
                        });

                    } else {

                        protectionToggleElement.setAttribute('class', 'button button-toggle active');

                        let disableProtectionTitle = chrome.i18n.getMessage('disableProtectionTitle');

                        protectionToggleElement.setAttribute('title', disableProtectionTitle);
                        protectionToggleElement.setAttribute('dir', scriptDirection);

                        protectionToggleElement.addEventListener('click', function () {

                            backgroundPage.stateManager.addDomainToWhitelist(domain).then(function () {

                                chrome.tabs.reload(tabs[0].id);

                                if (backgroundPage.main.operatingSystem === chrome.runtime.PlatformOs.ANDROID) {

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

                    cdnName = helpers.determineCdnName(injectionSource);

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

                        resourceName = helpers.determineResourceName(resourceFilename);

                        resourceNameTextNode = document.createTextNode(`- ${resourceName}`);
                        subListItemElement.appendChild(resourceNameTextNode);

                        sideNoteElement = document.createElement('span');
                        sideNoteElement.setAttribute('class', 'side-note');

                        sideNoteTextNode = document.createTextNode(` v${injection.version}`);

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

        if (popup.backgroundPage.main.operatingSystem === chrome.runtime.PlatformOs.ANDROID) {

            return chrome.tabs.create({
                'url': chrome.extension.getURL('pages/options/options.html')
            });
        }

        chrome.runtime.openOptionsPage();
        return window.close();
    });

    document.getElementById('testing-utility-link').addEventListener('mouseup', function (event) {

        if (event.button === 0 || event.button === 1) {

            chrome.tabs.create({
                'url': 'https://decentraleyes.org/test',
                'active': (event.button === 0)
            });
        }

        if (event.button === 0) {
            window.close();
        }
    });
});
