'use strict';

import Promise from 'es6-promises';

const TAG = '[BLEIo]'
const SERVICE_UUID = 'feed0001594246d5ade581c064d03a03';
const CHR_INTERVAL_UUID = 'feedaa02594246d5ade581c064d03a03';  // R/W
const CHR_DOUT_UUID = 'feedaa03594246d5ade581c064d03a03';      // R/W
const CHR_DIN_UUID = 'feedaa04594246d5ade581c064d03a03';       // R/N
const CHR_AIN_UUID = 'feedaa05594246d5ade581c064d03a03';       // R/N
const CHR_LCD_UUID = 'feedaa06594246d5ade581c064d03a03';       // R/W
const CHR_PWM_UUID = 'feedaa07594246d5ade581c064d03a03';       // R/W

/*
 * {
 *   "local name(BLEIo_0 to BLEIo_F)": {
 *     "MAC address or *(wildcard)" : {
 *       "node id": {visual node object},
 *     }
 *   }, ...
 * }
 */
const bleioNodes = {};

/*
 * {
 *   "local name(BLEIo_0 to BLEIo_F)": [{peripheral object},...], ...
 * }
 */
const bleioPeripherals = {};

let associationTask = null;

export function acceptFunc(localName) {
  return !!(localName &&
    (localName.indexOf('BLEIo_') === 0 && localName.length === 7));
}

export function discoverFunc(localName, peripheral, RED) {
  if (!bleioPeripherals[localName]) {
    bleioPeripherals[localName] = [];
  }
  let periphs = bleioPeripherals[localName];
  if (periphs.indexOf(peripheral) < 0) {
    if (!peripheral.nodes) {
      peripheral.nodes = [];
    }
    periphs.push(peripheral);
    RED.log.info(`local name[${localName}] has been detected => ${peripheral}`);
  }
}

function setupPeripheral(peripheral, RED) {
  peripheral.on('connect', (err) => {
    if (err) {
      RED.log.error(`[BLEIo:connect] err=${err}`);
      return;
    }
    peripheral.discoverAllServicesAndCharacteristics(SERVICE_UUID,
      [
        CHR_INTERVAL_UUID,
        CHR_DOUT_UUID,
        CHR_DIN_UUID,
        CHR_AIN_UUID,
        CHR_LCD_UUID,
        CHR_PWM_UUID
      ], (err) => {
        if (err) {
          RED.log.error(RED._('asakusa_giken.errors.unexpected-peripheral'));
          peripheral.disconnect();
          return;
        }
      }
    );
  });
  peripheral.on('disconnect', (err) => {
    if (err) {
      RED.log.info(`[BLEIo:disconnect] err=${err}`);
      return;
    }
    Object.values(bleioPeripherals).forEach(ary => {
      let i = ary.indexOf(peripheral);
      if (i >= 0) {
        ary.splice(i, 1);
      }
    });
    if (!peripheral.terminated) {
      peripheral.connect();
    }
  });
  peripheral.terminate = () => {
    peripheral.terminated = true;
    peripheral.disconnect();
  };
  peripheral.connect();
}

function startAssociationTask(RED) {
  let retry = false;
  let unassociated = [];
  let associated = [];
  Object.keys(bleioNodes).forEach(localName => {
    let periphs = bleioPeripherals[localName];
    let nodes = bleioNodes[localName];
    if (!periphs || periphs.length === 0) {
      if (nodes && Object.keys(nodes).length > 0) {
        retry = true;
      }
      return;
    }
    if (!nodes || Object.keys(nodes).length === 0) {
      return;
    }
    periphs.forEach(peripheral => {
      Object.keys(nodes).forEach(address => {
        if (peripheral.nodes.indexOf(nodes[address]) < 0) {
          Object.keys(nodes[address]).forEach(id => {
            unassociated.push(nodes[address][id]);
          });
        }
      });
    });
    periphs.filter(peripheral => {
      for (let i in unassociated) {
        let address = unassociated[i].bleioNode.address || '*';
        if (('*' === address) ||
            (peripheral.address &&
            peripheral.address.toLowerCase() === address.toLowerCase())) {
          // mutual references
          peripheral.nodes.push(unassociated[i]);
          unassociated[i].peripheral = peripheral;
          // mark the node associated
          associated.push(unassociated[i]);
          return true;
        }
      }
      return false;
    }).forEach(peripheral => {
      setupPeripheral(peripheral, RED);
    });
  });
  if (unassociated.length > 0 && (associated.length !== unassociated.length)) {
    retry = true;
  }
  if (associationTask) {
    clearTimeout(associationTask);
    associationTask = null;
  }
  if (retry) {
    associationTask = setTimeout(() => {
      startAssociationTask(RED);
    }, 1000);
  }
}

export function register(node, RED) {
  if (!node || !node.bleioNode) {
    throw new Error('invalid node');
  }
  let localName = node.bleioNode.localName;
  if (!localName) {
    RED.log.error(RED._('asakusa_giken.errors.missing-localName', {id: node.bleioNode.id}));
    return;
  }
  let address = node.bleioNode.address || '*';
  if (!bleioNodes[localName]) {
    bleioNodes[localName] = {};
  }
  let periphNodes = bleioNodes[localName];
  if (!periphNodes[address]) {
    periphNodes[address] = {};
  }
  periphNodes[address][node.id] = node;
  if (!associationTask) {
    startAssociationTask(RED);
  }
}

export function remove(node, RED) {
  if (!node || !node.bleioNode) {
    throw new Error('invalid node');
  }
  let localName = node.bleioNode.localName;
  if (!localName) {
    return;
  }
  let address = node.bleioNode.address || '*';
  if (!bleioNodes[localName]) {
    return;
  }
  let periphNodes = bleioNodes[localName];
  if (!periphNodes[address] || !periphNodes[address][node.id]) {
    return;
  }
  let peripheral = periphNodes[address][node.id].peripheral;
  let periphHoldingNodes = peripheral.nodes;
  let i = periphHoldingNodes.indexOf(node);
  if (i >= 0) {
    periphHoldingNodes.splice(i, 1);
  }
  delete periphNodes[address][node.id].peripheral;
  delete periphNodes[address][node.id];
  if (periphNodes.length === 0) {
    peripheral.terminate();
  }
}

export function clear() {
  // do nothing
}
