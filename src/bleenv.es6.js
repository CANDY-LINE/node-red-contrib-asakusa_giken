'use strict';

import Promise from 'es6-promises';
import LRU from 'lru-cache';
import * as ble from './ble';

const TAG = '[BLEENV]'
const CONN_DEBUG = false;
/*
 * {
 *   "local name(ENV_0 to ENV_F)": {
 *     "MAC address or *(wildcard)" : {
 *       "node id": {visual node object},
 *     }
 *   }, ...
 * }
 */
const bleenvNodes = {};

let unknown = LRU({
  max: 100,
  maxAge: 1000 * 60 * 60
});
export function acceptFunc(localName) {
  return !!(localName &&
    (localName.indexOf('ENV_') === 0 && localName.length === 5));
}

export function discoverFunc(localName, peripheral, RED) {
  if (CONN_DEBUG) { RED.log.info(`${TAG}[CONN_DEBUG] (discoverFunc) [${localName}:${peripheral.address}] ${peripheral.state}`); }
  let nodesMap = bleenvNodes[localName];
  if (nodesMap) {
    let nodes = [];
    Object.keys(nodesMap).filter((address) => {
      return address === '*' || address === peripheral.address;
    }).forEach((address) => {
      let nodeCollection = nodesMap[address];
      Object.keys(nodeCollection).forEach((id) => {
        nodes.push(nodeCollection[id]);
      });
    });
    let adv = peripheral.advertisement;
    let now = Date.now();
    // http://www.robotsfx.com/robot/BLECAST_ENV.html
    let data = adv.manufacturerData;
    let hu = 125 * (256 * data[0] + data[1]) / 65536 - 6;
    if (hu < 0) {
      hu = null;
    }
    let te = 175.72 * (256 * data[2] + data[3]) /65536 - 46.85;
    let lx = 256 * data[4] + data[5];
    nodes.forEach((node) => {
      let payload = {
        tstamp: now,
        rssi: peripheral.rssi,
        address: peripheral.address,
        te: te,
        lx: lx
      };
      if (hu) {
        payload.hu = hu;
      }
      if (node.useString) {
        payload = JSON.stringify(payload);
      }
      if (CONN_DEBUG) {
        if (node.useString) {
          RED.log.info(`${TAG} payload=>${payload}`);
        } else {
          RED.log.info(`${TAG} payload=>${JSON.stringify(payload)}`);
        }
      }
      node.send({'payload': payload});
    });
    if (nodes.length > 0) {
      return true;
    }
  }
  // unknown
  let key = localName + ':' + (peripheral.address ? '*' : peripheral.address);
  if (!unknown.get(key)) {
    unknown.set(key, 1);
    RED.log.warn(RED._('asakusa_giken.errors.unknown-peripheral',
      { categoryName: localName, peripheralAddress: peripheral.address, peripheralUuid: peripheral.uuid }));
  }
  return false;
}

export function register(node, RED) {
  if (CONN_DEBUG) { RED.log.info(`${TAG}[CONN_DEBUG] (register) start`); }
  if (!node || !node.bleenvNode) {
    throw new Error('invalid node');
  }
  let localName = node.bleenvNode.localName;
  if (!localName) {
    RED.log.error(RED._('asakusa_giken.errors.missing-localName', {id: node.bleenvNode.id}));
    return;
  }
  if (!bleenvNodes[localName]) {
    bleenvNodes[localName] = {};
  }
  let periphNodes = bleenvNodes[localName];
  let address = node.bleenvNode.address || '*';
  if (!periphNodes[address]) {
    periphNodes[address] = {};
  }
  periphNodes[address][node.id] = node;
  if (CONN_DEBUG) { RED.log.info(`${TAG}[CONN_DEBUG] (register) end`); }
}

export function remove(node, RED) {
  if (!node || !node.bleenvNode) {
    throw new Error('invalid node');
  }
  let localName = node.bleenvNode.localName;
  if (!localName) {
    return false;
  }
  let address = node.bleenvNode.address || '*';
  if (!bleenvNodes[localName]) {
    return false;
  }
  let periphNodes = bleenvNodes[localName];
  if (!periphNodes[address] || !periphNodes[address][node.id]) {
    return false;
  }
  delete periphNodes[address][node.id];
  return true;
}

export function clear(RED) {
  unknown.reset();
  RED.log.info(`${TAG} Unknown cache cleared`);
}
