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

const HOST_PREFIX = '*://';
const HOST_SUFFIX = '/*';
const HTTP_EXPRESSION = /^http?:\/\//;
const MAPPING_FILE_EXPRESSION = /\.map$/i;
const REQUEST_BLOCKING = 'blocking';
const REQUEST_HEADERS = 'requestHeaders';
const VALUE_SEPARATOR = ';';
const VERSION_EXPRESSION = /(?:\d{1,2}\.){1,3}\d{1,2}/;
const VERSION_PLACEHOLDER = '{version}';
const WEB_DOMAIN_EXPRESSION = /:\/\/(.[^/]+)(.*)/;
const WEB_PREFIX_LENGTH = 4;
const WEB_PREFIX_VALUE = 'www.';
