/**
 * Global Constants
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2017-10-27
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Constants
 */

const Address = {
    'ANY': '*://*/*',
    'ANY_PATH': '/*',
    'ANY_PROTOCOL': '*://',
    'CHROME_EXTENSION': 'chrome-extension:',
    'DECENTRALEYES': 'decentraleyes.org',
    'EXAMPLE': 'example.org',
    'HTTP': 'http:',
    'HTTPS': 'https:',
    'WWW_PREFIX': 'www.'
};

const Header = {
    'COOKIE': 'Cookie',
    'ORIGIN': 'Origin',
    'REFERER': 'Referer'
};

const MessageResponse = {
    'ASYNCHRONOUS': true,
    'SYNCHRONOUS': false
};

const Resource = {
    'MAPPING_EXPRESSION': /\.map$/i,
    'VERSION_EXPRESSION': /(?:\d{1,2}\.){1,3}\d{1,2}/,
    'VERSION_PLACEHOLDER': '{version}'
};

const Setting = {
    'AMOUNT_INJECTED': 'amountInjected',
    'BLOCK_MISSING': 'blockMissing',
    'DISABLE_PREFETCH': 'disablePrefetch',
    'SHOW_ICON_BADGE': 'showIconBadge',
    'SHOW_RELEASE_NOTES': 'showReleaseNotes',
    'STRIP_METADATA': 'stripMetadata',
    'WHITELISTED_DOMAINS': 'whitelistedDomains',
    'XHR_TEST_DOMAIN': 'xhrTestDomain'
};

const WebRequest = {
    'GET': 'GET',
    'BLOCKING': 'blocking',
    'HEADERS': 'requestHeaders'
};

const WebRequestType = {
    'MAIN_FRAME': 'main_frame',
    'XHR': 'xmlhttprequest'
};

const Whitelist = {
    'TRIM_EXPRESSION': /^;+|;+$/g,
    'VALUE_SEPARATOR': ';'
};
