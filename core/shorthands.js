/**
 * Shorthands
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2018-02-24
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Shorthands
 */

var shorthands = {

    // Google Hosted Libraries [Deprecated]
    'ajax.googleapis.com': {
        'resources/jquery/1.8/jquery.min.jsm': {
            'path': 'resources/jquery/1.8.3/jquery.min.jsm',
            'version': '1.8.3'
        },
        'resources/jquery/1.7/jquery.min.jsm': {
            'path': 'resources/jquery/1.7.2/jquery.min.jsm',
            'version': '1.7.2'
        },
        'resources/jquery/1.6/jquery.min.jsm': {
            'path': 'resources/jquery/1.6.4/jquery.min.jsm',
            'version': '1.6.4'
        },
        'resources/jquery/1.5/jquery.min.jsm': {
            'path': 'resources/jquery/1.5.2/jquery.min.jsm',
            'version': '1.5.2'
        },
        'resources/jquery/1.4/jquery.min.jsm': {
            'path': 'resources/jquery/1.4.4/jquery.min.jsm',
            'version': '1.4.4'
        },
        'resources/jquery/1.3/jquery.min.jsm': {
            'path': 'resources/jquery/1.3.2/jquery.min.jsm',
            'version': '1.3.2'
        },
        'resources/jquery/1.2/jquery.min.jsm': {
            'path': 'resources/jquery/1.2.6/jquery.min.jsm',
            'version': '1.2.6'
        }
    },
    // jQuery CDN [Deprecated]
    'code.jquery.com': {
        'resources/jquery/1.7/jquery.min.jsm': {
            'path': 'resources/jquery/1.7.0/jquery.min.jsm',
            'version': '1.7.0'
        },
        'resources/jquery/1.6/jquery.min.jsm': {
            'path': 'resources/jquery/1.6.0/jquery.min.jsm',
            'version': '1.6.0'
        },
        'resources/jquery/1.5/jquery.min.jsm': {
            'path': 'resources/jquery/1.5.0/jquery.min.jsm',
            'version': '1.5.0'
        },
        'resources/jquery/1.4/jquery.min.jsm': {
            'path': 'resources/jquery/1.4.0/jquery.min.jsm',
            'version': '1.4.0'
        },
        'resources/jquery/1.3/jquery.min.jsm': {
            'path': 'resources/jquery/1.3.0/jquery.min.jsm',
            'version': '1.3.0'
        }
    }
};

// Geekzu Public Service [Mirror]
shorthands['sdn.geekzu.org'] = shorthands['ajax.googleapis.com'];

// USTC Linux User Group [Mirror]
shorthands['ajax.proxy.ustclug.org'] = shorthands['ajax.googleapis.com'];
