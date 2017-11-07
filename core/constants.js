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
    'DOMAIN_EXPRESSION': /:\/\/(.[^/]+)(.*)/,
    'EXAMPLE': 'example.org',
    'HTTP_EXPRESSION': /^http?:\/\//,
    'HTTPS': 'https://',
    'WWW_PREFIX': 'www.',
    'WWW_PREFIX_LENGTH': 4
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
    'STRIP_METADATA': 'stripMetadata',
    'WHITELISTED_DOMAINS': 'whitelistedDomains'
};

const WebRequest = {
    'GET': 'GET',
    'BLOCKING': 'blocking',
    'HEADERS': 'requestHeaders',
    'ORIGIN_HEADER': 'Origin',
    'REFERER_HEADER': 'Referer'
};

const Whitelist = {
    'TRIM_EXPRESSION': /^;+|;+$/g,
    'VALUE_SEPARATOR': ';'
};
