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
const TYPE_INTERVAL = 'INTERVAL';
const TYPE_DOUT = 'DOUT';
const TYPE_DIN = 'DIN';
const TYPE_AIN = 'AIN';
const TYPE_LCD = 'LCD';
const TYPE_PWM = 'PWM';
const UUID_TO_TYPE = {};
UUID_TO_TYPE[CHR_INTERVAL_UUID] = TYPE_INTERVAL;
UUID_TO_TYPE[CHR_DOUT_UUID] = TYPE_DOUT;
UUID_TO_TYPE[CHR_DIN_UUID] = TYPE_DIN;
UUID_TO_TYPE[CHR_AIN_UUID] = TYPE_AIN;
UUID_TO_TYPE[CHR_LCD_UUID] = TYPE_LCD;
UUID_TO_TYPE[CHR_PWM_UUID] = TYPE_PWM;
const TYPE_TO_UUID = {};
TYPE_TO_UUID[TYPE_INTERVAL] = CHR_INTERVAL_UUID;
TYPE_TO_UUID[TYPE_DOUT] = CHR_DOUT_UUID;
TYPE_TO_UUID[TYPE_DIN] = CHR_DIN_UUID;
TYPE_TO_UUID[TYPE_AIN] = CHR_AIN_UUID;
TYPE_TO_UUID[TYPE_LCD] = CHR_LCD_UUID;
TYPE_TO_UUID[TYPE_PWM] = CHR_PWM_UUID;

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
    RED.log.warn(`local name[${localName}] has been detected (address:${peripheral.address})`);
  }
}

function findChr(uuid, characteristics) {
  for (let i in characteristics) {
    if (characteristics[i].uuid === uuid) {
      return characteristics[i];
    }
  }
  return null;
}

function valToBuffer(hexOrIntArray) {
  if (Buffer.isBuffer(hexOrIntArray)) {
    return hexOrIntArray;
  }
  if (typeof hexOrIntArray === 'number') {
    return new Buffer(parseInt(hexOrIntArray).toString(16), 'hex');
  }
  if (typeof hexOrIntArray === 'string') {
    return new Buffer(hexOrIntArray, 'hex');
  }
  if (Array.isArray(hexOrIntArray)) {
    return new Buffer(hexOrIntArray);
  }
  return new Buffer();
}

function setupPeripheral(peripheral, RED) {
  if (peripheral.instrumented) {
    if (peripheral.state !== 'connected') {
      peripheral.connect();
    }
    return;
  }
  let connectHandler = (err) => {
    if (err) {
      RED.log.error(`[BLEIo:connect] err=${err}`);
      return;
    }
    if (peripheral && peripheral.nodes) {
      peripheral.nodes.forEach((node) => {
        node.emit('opened');
      });
    }
    peripheral.discoverSomeServicesAndCharacteristics(
      [
        SERVICE_UUID
      ],
      [
        CHR_INTERVAL_UUID,
        CHR_DOUT_UUID,
        CHR_DIN_UUID,
        CHR_AIN_UUID,
        CHR_LCD_UUID,
        CHR_PWM_UUID
      ], (err, _, characteristics) => {
        if (err) {
          RED.log.error(RED._('asakusa_giken.errors.unexpected-peripheral'));
          peripheral.disconnect();
          return;
        }
        // write init params
        if (peripheral.nodes && peripheral.nodes.length > 0) {
          let config = peripheral.nodes[0].bleioNode;
          let val = parseInt(config.initInterval);
          if (val > 0) {
            findChr(CHR_INTERVAL_UUID, characteristics).write(valToBuffer(val), true);
          }
          // TODO initLcd
          val = parseInt(config.initDout) & 0xFF;
          if (val) {
            findChr(CHR_DOUT_UUID, characteristics).write(valToBuffer(val), true);
          }
          val = parseInt(config.initPwm) & 0xFFFFFF;
          if (val) {
            findChr(CHR_PWM_UUID, characteristics).write(valToBuffer(val), true);
          }
        }
        // in nodes
        characteristics.forEach((c) => {
          let uuid = c.uuid.toLowerCase();
          if (!c.subscribed &&
              ((uuid === CHR_DIN_UUID) || (uuid === CHR_AIN_UUID))) {
            c.subscribe((err) => {
              if (err) {
                RED.log.error(err);
                RED.log.error(RED._('asakusa_giken.errors.unexpected-peripheral'));
                if (peripheral) {
                  peripheral.disconnect();
                }
                return;
              }
              c.on('data', (data, isNotification) => {
                if (isNotification && peripheral && peripheral.nodes) {
                  peripheral.nodes.forEach((node) => {
                    if (node.in) {
                      node.send({
                        payload: {
                          type: UUID_TO_TYPE[uuid],
                          val: data
                        }
                      });
                    }
                  });
                }
              });
              c.notify(true);
              c.subscribed = true;
              RED.log.info(`[BLEIo] Subscribed to ${UUID_TO_TYPE[uuid]}`);
            });
          }
        });
        // out nodes
        if (peripheral.nodes) {
          peripheral.nodes.forEach((node) => {
            if (!node.in) {
              node.on('input', (msg) => {
                let values = msg.payload;
                if (!values) {
                  return;
                }
                if (!Array.isArray(values)) {
                  values = [values];
                }
                values.forEach((v) => {
                  if (!v.type) {
                    return;
                  }
                  let uuid = TYPE_TO_UUID[v.type];
                  if (!uuid) {
                    return;
                  }
                  let data = valToBuffer(v.val);
                  findChr(uuid, characteristics).write(data, true);
                });
              });
            }
          });
        }
      }
    );
  };
  let disconnectHandler = (err) => {
    if (err) {
      RED.log.info(`[BLEIo:disconnect] err=${err}`);
      if (peripheral && peripheral.nodes) {
        peripheral.nodes.forEach((node) => {
          node.emit('erro');
        });
      }
      return;
    }
    Object.keys(bleioPeripherals).forEach((localName) => {
      let ary = bleioPeripherals[localName];
      let i = ary.indexOf(peripheral);
      if (i >= 0) {
        ary.splice(i, 1);
      }
    });
    if (peripheral.terminated) {
      if (peripheral && peripheral.nodes) {
        peripheral.nodes.forEach((node) => {
          node.emit('closed');
        });
      }
    } else {
      peripheral.connect();
    }
  };
  peripheral.on('connect', connectHandler);
  peripheral.on('disconnect', disconnectHandler);
  peripheral.terminate = () => {
    peripheral.instrumented = false;
    peripheral.terminated = true;
    peripheral.removeListener('connect', connectHandler);
    peripheral.removeListener('disconnect', disconnectHandler);
    if (peripheral.state !== 'disconnected') {
      peripheral.disconnect((err) => {
        disconnectHandler(err);
      });
    }
  };
  peripheral.instrumented = true;
  if (peripheral.state !== 'connected') {
    peripheral.connect();
  }
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
        Object.keys(nodes[address]).forEach(id => {
          if (peripheral.nodes && peripheral.nodes.indexOf(nodes[address][id]) < 0) {
            unassociated.push(nodes[address][id]);
          }
        });
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
          if (peripheral.state === 'connected') {
            unassociated[i].emit('opened');
          } else if (peripheral.state === 'disconnected') {
            unassociated[i].emit('closed');
          }
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
  if (!bleioNodes[localName]) {
    bleioNodes[localName] = {};
  }
  let periphNodes = bleioNodes[localName];
  let address = node.bleioNode.address || '*';
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
    return false;
  }
  let address = node.bleioNode.address || '*';
  if (!bleioNodes[localName]) {
    return false;
  }
  let periphNodes = bleioNodes[localName];
  if (!periphNodes[address] || !periphNodes[address][node.id]) {
    return false;
  }
  let peripheral = periphNodes[address][node.id].peripheral;
  if (peripheral) {
    let periphHoldingNodes = peripheral.nodes;
    let i = periphHoldingNodes.indexOf(node);
    if (i >= 0) {
      periphHoldingNodes.splice(i, 1);
    }
    delete periphNodes[address][node.id].peripheral;
    if (Object.keys(periphNodes[address]).length === 0) {
      peripheral.terminate();
    }
  }
  delete periphNodes[address][node.id];
  node.emit('closed');
  return true;
}

export function clear() {
  // do nothing
}
