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
 * Private Methods
 */

popup._renderContents = function () {

    helpers.insertI18nContentIntoDocument(document);
    helpers.insertI18nTitlesIntoDocument(document);

    popup._renderNonContextualContents();

    if (popup._backgroundPage !== null) {

        popup._determineTargetTab()
            .then(popup._renderContextualContents);
    }
};

popup._renderNonContextualContents = function () {

    let versionLabelElement, counterElement, testingUtilityLinkElement, optionsButtonElement;

    versionLabelElement = document.getElementById('version-label');
    counterElement = document.getElementById('injection-counter');
    testingUtilityLinkElement = document.getElementById('testing-utility-link');
    optionsButtonElement = document.getElementById('options-button');

    versionLabelElement.innerText = popup._version;
    counterElement.innerText = helpers.formatNumber(popup._amountInjected);

    testingUtilityLinkElement.addEventListener('mouseup', popup._onTestingUtilityLinkClicked);
    optionsButtonElement.addEventListener('mouseup', popup._onOptionsButtonClicked);
};

popup._renderContextualContents = function () {

    let injections, groupedInjections;

    popup._domain = helpers.extractDomainFromUrl(popup._targetTab.url);

    popup._requestAnalyzer = popup._backgroundPage.requestAnalyzer;
    popup._stateManager = popup._backgroundPage.stateManager;

    if (popup._domain !== null) {

        popup._domain = helpers.normalizeDomain(popup._domain);
        popup._renderDomainWhitelistPanel();
    }

    injections = popup._stateManager.tabs[popup._targetTab.id].injections;
    groupedInjections = popup._groupResourceInjections(injections);

    if (Object.keys(groupedInjections).length > 0) {
        popup._renderInjectionPanel(groupedInjections);
    }
};

popup._renderDomainWhitelistPanel = function () {

    let websiteContextElement, protectionToggleElement, domainIndicatorElement;

    websiteContextElement = document.getElementById('website-context');
    protectionToggleElement = document.getElementById('protection-toggle-button');
    domainIndicatorElement = document.getElementById('domain-indicator');

    protectionToggleElement.setAttribute('dir', popup._scriptDirection);
    domainIndicatorElement.innerText = popup._domain;

    if (popup._requestAnalyzer.whitelistedDomains[popup._domain]) {

        let enableProtectionTitle = chrome.i18n.getMessage('enableProtectionTitle');

        protectionToggleElement.setAttribute('class', 'button button-toggle');
        protectionToggleElement.addEventListener('click', popup._enableProtection);
        protectionToggleElement.setAttribute('title', enableProtectionTitle);

    } else {

        let disableProtectionTitle = chrome.i18n.getMessage('disableProtectionTitle');

        protectionToggleElement.setAttribute('class', 'button button-toggle active');
        protectionToggleElement.addEventListener('click', popup._disableProtection);
        protectionToggleElement.setAttribute('title', disableProtectionTitle);
    }

    websiteContextElement.setAttribute('class', 'panel');
};

popup._renderInjectionPanel = function (groupedInjections) {

    let websiteContextElement, injectionOverviewElement;

    websiteContextElement = document.getElementById('website-context');
    injectionOverviewElement = popup._createInjectionOverviewElement(groupedInjections);

    websiteContextElement.append(injectionOverviewElement);
};

popup._enableProtection = function () {

    popup._stateManager.deleteDomainFromWhitelist(popup._domain)
        .then(popup._onProtectionToggled);
};

popup._disableProtection = function () {

    popup._stateManager.addDomainToWhitelist(popup._domain)
        .then(popup._onProtectionToggled);
};

popup._determineBackgroundPage = function () {

    return new Promise((resolve) => {

        chrome.runtime.getBackgroundPage(function (backgroundPage) {

            popup._backgroundPage = backgroundPage;
            resolve();
        });
    });
};

popup._determineTargetTab = function () {

    return new Promise((resolve) => {

        chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {

            popup._targetTab = tabs[0];
            resolve();
        });
    });
};

popup._determineAmountInjected = function () {

    return new Promise((resolve) => {

        chrome.storage.local.get(Setting.AMOUNT_INJECTED, function (items) {

            popup._amountInjected = items.amountInjected || 0;
            resolve();
        });
    });
};

popup._groupResourceInjections = function (injections) {

    let groupedInjections = {};

    for (let index in injections) {

        let {source} = injections[index];

        groupedInjections[source] = groupedInjections[source] || [];
        groupedInjections[source].push(injections[index]);
    }

    return groupedInjections;
};

popup._createInjectionOverviewElement = function (groupedInjections) {

    let injectionOverviewElement = document.createElement('ul');
    injectionOverviewElement.setAttribute('class', 'list');

    for (let source in groupedInjections) {

        let injectionGroupHeaderElement, injectionGroupElement, cdn;

        cdn = groupedInjections[source];

        injectionGroupHeaderElement = popup._createInjectionGroupHeaderElement(source, cdn);
        injectionGroupElement = popup._createInjectionGroupElement(source, cdn);

        injectionOverviewElement.appendChild(injectionGroupHeaderElement);
        injectionOverviewElement.appendChild(injectionGroupElement);
    }

    return injectionOverviewElement;
};

popup._createInjectionGroupHeaderElement = function (source, cdn) {

    let injectionGroupHeaderElement, badgeElement, badgeTextNode, cdnNameTextNode;

    injectionGroupHeaderElement = document.createElement('li');
    injectionGroupHeaderElement.setAttribute('class', 'list-item');

    badgeElement = document.createElement('span');
    badgeElement.setAttribute('class', 'badge');

    badgeTextNode = document.createTextNode(cdn.length);
    badgeElement.appendChild(badgeTextNode);

    cdnNameTextNode = document.createTextNode(helpers.determineCdnName(source));

    injectionGroupHeaderElement.appendChild(badgeElement);
    injectionGroupHeaderElement.appendChild(cdnNameTextNode);

    return injectionGroupHeaderElement;
};

popup._createInjectionGroupElement = function (source, cdn) {

    let injectionGroupElement;

    injectionGroupElement = document.createElement('ul');
    injectionGroupElement.setAttribute('class', 'sublist');

    for (let injection of cdn) {

        let injectionElement = popup._createInjectionElement(injection);
        injectionGroupElement.appendChild(injectionElement);
    }

    return injectionGroupElement;
};

popup._createInjectionElement = function (injection) {

    let injectionElement, filename, name, nameTextNode, noteElement, noteTextNode;

    injectionElement = document.createElement('li');
    injectionElement.setAttribute('class', 'sublist-item');

    filename = helpers.extractFilenameFromPath(injection.path);
    name = helpers.determineResourceName(filename);

    nameTextNode = document.createTextNode(`- ${name}`);
    injectionElement.appendChild(nameTextNode);

    noteElement = document.createElement('span');
    noteElement.setAttribute('class', 'side-note');

    noteTextNode = document.createTextNode(` v${injection.version}`);

    noteElement.appendChild(noteTextNode);
    injectionElement.appendChild(noteElement);

    return injectionElement;
};

popup._close = function () {

    chrome.runtime.getPlatformInfo(function (information) {

        if (information.os === chrome.runtime.PlatformOs.ANDROID) {

            chrome.tabs.getCurrent(function (tab) {
                chrome.tabs.remove(tab.id);
            });

        } else {
            window.close();
        }
    });
};

/**
 * Event Handlers
 */

popup._onDocumentLoaded = function () {

    let manifest, language;

    manifest = chrome.runtime.getManifest();
    language = navigator.language;

    popup._version = helpers.formatVersion(manifest.version);
    popup._scriptDirection = helpers.determineScriptDirection(language);

    popup._determineBackgroundPage()
        .then(popup._determineAmountInjected)
        .then(popup._renderContents);
};

popup._onTestingUtilityLinkClicked = function (event) {

    if (event.button === 0 || event.button === 1) {

        chrome.tabs.create({
            'url': 'https://decentraleyes.org/test',
            'active': (event.button === 0)
        });
    }

    if (event.button === 0) {
        window.close();
    }
};

popup._onOptionsButtonClicked = function () {

    chrome.runtime.openOptionsPage();
    return window.close();
};

popup._onProtectionToggled = function () {

    let bypassCache = (typeof browser === 'undefined');

    chrome.tabs.reload(popup._targetTab.id, {bypassCache});
    popup._close();
};

/**
 * Initializations
 */

document.addEventListener('DOMContentLoaded', popup._onDocumentLoaded);
