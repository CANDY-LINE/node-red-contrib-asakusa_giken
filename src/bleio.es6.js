'use strict';

import Promise from 'es6-promises';
import LRU from 'lru-cache';

const TAG = '[BLEIo]'

export function acceptFunc(categoryName) {
  return ('BLEIo_'.indexOf(categoryName) === 0 && categoryName.length === 7);
}

export function discoverFunc(categoryName, peripheral, RED) {
  // TODO connect and subscribe, auto reconnect
}

/*
 * {
 *   'node type name(BLEIo in/BLEIo out)': {
 *     'local name(BLEIo_0 to BLEIo_F)': {
 *       'MAC address or *(wildcard)' : {
 *         'node': {visual node object},
 *       }
 *     }
 *   }
 * }
 */
let bleioPeripherals = {};
let unknown = LRU({
  max: 100,
  maxAge: 1000 * 60 * 60
});

export function register() {

}
export function remove() {

}
export function clear() {
  unknown.reset();
  RED.log.info(`${TAG} Unknown cache cleared`);
}
