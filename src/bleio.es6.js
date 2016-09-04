'use strict';

import Promise from 'es6-promises';

const TAG = '[BLEIo]'
const SERVICE_UUID = 'feed0001594246d5ade581c064d03a03';

const LCD_CHAR_TABLE = {
  0x00: '', 0x01: '', 0x02: '', 0x03: '', 0x04: '', 0x05: '', 0x06: '↓', 0x07: '→',
  0x08: '←', 0x09: ['⌈','┌','┍','┎','┏'], 0x0A: ['⌉','┐','┑','┒','┓'],
    0x0B: ['⌊','└','┕','┖','┗'], 0x0C: ['⌋','┘','┙','┚','┛'],
    0x0D: ['•','⋅'], 0x0E: '®', 0x0F: '©',
  0x10: '™', 0x11: '†', 0x12: '§', 0x13: '¶', 0x14: 'Γ', 0x15: 'Δ', 0x16: 'Θ', 0x17: 'Λ',
  0x18: 'Ξ', 0x19: 'Π', 0x1A: 'Σ', 0x1B: 'Υ', 0x1C: 'Φ', 0x1D: 'Ψ', 0x1E: 'Ω', 0x1F: 'α',
  0x20: ' ', 0x21: '!', 0x22: '"', 0x23: '#', 0x24: '$', 0x25: '%', 0x26: '&', 0x27: '\'',
  0x28: '(', 0x29: ')', 0x2A: '*', 0x2B: '+', 0x2C: ',', 0x2D: '-', 0x2E: '.', 0x2F: '/',
  0x30: '0', 0x31: '1', 0x32: '2', 0x33: '3', 0x34: '4', 0x35: '5', 0x36: '6', 0x37: '7',
  0x38: '8', 0x39: '9', 0x3A: ':', 0x3B: ';', 0x3C: '<', 0x3D: '=', 0x3E: '>', 0x3F: '?',
  0x40: '@', 0x41: 'A', 0x42: 'B', 0x43: 'C', 0x44: 'D', 0x45: 'E', 0x46: 'F', 0x47: 'G',
  0x48: 'H', 0x49: 'I', 0x4A: 'J', 0x4B: 'K', 0x4C: 'L', 0x4D: 'M', 0x4E: 'N', 0x4F: 'O',
  0x50: 'P', 0x51: 'Q', 0x52: 'R', 0x53: 'S', 0x54: 'T', 0x55: 'U', 0x56: 'V', 0x57: 'W',
  0x58: 'X', 0x59: 'Y', 0x5A: 'Z', 0x5B: '[', 0x5C: '\\', 0x5D: ']', 0x5E: '^', 0x5F: '_',
  0x60: '`', 0x61: 'a', 0x62: 'b', 0x63: 'c', 0x64: 'd', 0x65: 'e', 0x66: 'f', 0x67: 'g',
  0x68: 'h', 0x69: 'i', 0x6A: 'j', 0x6B: 'k', 0x6C: 'l', 0x6D: 'm', 0x6E: 'n', 0x6F: 'o',
  0x70: 'p', 0x71: 'q', 0x72: 'r', 0x73: 's', 0x74: 't', 0x75: 'u', 0x76: 'v', 0x77: 'w',
  0x78: 'x', 0x79: 'y', 0x7A: 'z', 0x7B: '{', 0x7C: '|', 0x7D: '}', 0x7E: '→', 0x7F: '←',
  0x80: 'Ç', 0x81: 'ü', 0x82: 'é', 0x83: 'â', 0x84: 'ä', 0x85: 'à', 0x86: 'å', 0x87: 'ç',
  0x88: 'ê', 0x89: 'ë', 0x8A: 'è', 0x8B: 'ï', 0x8C: 'î', 0x8D: 'ì', 0x8E: 'Ä', 0x8F: 'Å',
  0x90: 'É', 0x91: 'æ', 0x92: 'Æ', 0x93: 'ô', 0x94: 'ö', 0x95: 'ò', 0x96: 'û', 0x97: 'ù',
  0x98: 'ÿ', 0x99: 'Ö', 0x9A: 'Ü', 0x9B: 'ñ', 0x9C: 'Ñ', 0x9D: 'ā', 0x9E: 'ō', 0x9F: '¿',
  0xA0: ' ', 0xA1: '｡', 0xA2: '｢', 0xA3: '｣', 0xA4: '､', 0xA5: '･', 0xA6: 'ｦ', 0xA7: 'ｧ',
  0xA8: 'ｨ', 0xA9: 'ｩ', 0xAA: 'ｪ', 0xAB: 'ｫ', 0xAC: 'ｬ', 0xAD: 'ｭ', 0xAE: 'ｮ', 0xAF: 'ｯ',
  0xB0: 'ｰ', 0xB1: 'ｱ', 0xB2: 'ｲ', 0xB3: 'ｳ', 0xB4: 'ｴ', 0xB5: 'ｵ', 0xB6: 'ｶ', 0xB7: 'ｷ',
  0xB8: 'ｸ', 0xB9: 'ｹ', 0xBA: 'ｺ', 0xBB: 'ｻ', 0xBC: 'ｼ', 0xBD: 'ｽ', 0xBE: 'ｾ', 0xBF: 'ｿ',
  0xC0: 'ﾀ', 0xC1: 'ﾁ', 0xC2: 'ﾂ', 0xC3: 'ﾃ', 0xC4: 'ﾄ', 0xC5: 'ﾅ', 0xC6: 'ﾆ', 0xC7: 'ﾇ',
  0xC8: 'ﾈ', 0xC9: 'ﾉ', 0xCA: 'ﾊ', 0xCB: 'ﾋ', 0xCC: 'ﾌ', 0xCD: 'ﾍ', 0xCE: 'ﾎ', 0xCF: 'ﾏ',
  0xD0: 'ﾐ', 0xD1: 'ﾑ', 0xD2: 'ﾒ', 0xD3: 'ﾓ', 0xD4: 'ﾔ', 0xD5: 'ﾕ', 0xD6: 'ﾖ', 0xD7: 'ﾗ',
  0xD8: 'ﾘ', 0xD9: 'ﾙ', 0xDA: 'ﾚ', 0xDB: 'ﾛ', 0xDC: 'ﾜ', 0xDD: 'ﾝ', 0xDE: 'ﾞ', 0xDF: 'ﾟ',
  0xE0: 'á', 0xE1: 'í', 0xE2: 'ó', 0xE3: 'ú', 0xE4: '¢', 0xE5: '£', 0xE6: '¥', 0xE7: '㌽',
  0xE8: 'ƒ', 0xE9: 'İ', 0xEA: 'Ã', 0xEB: 'ã', 0xEC: 'Õ', 0xED: 'õ', 0xEE: 'Ø', 0xEF: 'ø',
  0xF0: '˙', 0xF1: '¨', 0xF2: ['°','˚'], 0xF3: 'ˋ', 0xF4: 'ˊ', 0xF5: '½', 0xF6: '¼', 0xF7: '×',
  0xF8: '÷', 0xF9: '≤', 0xFA: '≥', 0xFB: '≪', 0xFC: '≫', 0xFD: '≠', 0xFE: '√', 0xFF: '‾',
};
const LCD_CHAR_TABLE_REV = {};
Object.keys(LCD_CHAR_TABLE).forEach((code) => {
  let chars = LCD_CHAR_TABLE[code];
  if (Array.isArray(chars)) {
    chars.forEach((c) => {
      LCD_CHAR_TABLE_REV[c] = code;
    });
  } else {
   LCD_CHAR_TABLE_REV[chars] = code;
  }
});

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

// Parsing raw binary
const UUID_VAL_PARSER = {};
UUID_VAL_PARSER[CHR_INTERVAL_UUID] = (raw) => {
  if (Buffer.isBuffer(raw) && raw.length === 2) {
    return (parseInt(raw.toString('hex'), 16));
  }
  return raw;
};
UUID_VAL_PARSER[CHR_DOUT_UUID] = (raw) => {
  if (Buffer.isBuffer(raw) && raw.length === 1) {
    let val = {};
    let dout = (parseInt(raw.toString('hex'), 16));
    for (let i = 1; i <= 8; i++) {
      val['dout' + i] = ((dout & 1) === 1);
      dout >>= 1;
    }
    return val;
  }
  return raw;
};
UUID_VAL_PARSER[CHR_DIN_UUID] = (raw) => {
  if (Buffer.isBuffer(raw) && raw.length === 1) {
    let val = {};
    let din = (parseInt(raw.toString('hex'), 16));
    for (let i = 1; i <= 8; i++) {
      val['din' + i] = ((din & 1) === 1);
      din >>= 1;
    }
    return val;
  }
  return raw;
};
UUID_VAL_PARSER[CHR_AIN_UUID] = (raw) => {
  if (Buffer.isBuffer(raw) && raw.length === 12) {
    let val = {};
    for (let i = 1; i <= 6; i++) {
      let ain = (parseInt(raw.slice(i * 2 - 2, i * 2).toString('hex'), 16));
      val['ain' + i] = 3.6 / 1024 * ain;
    }
    return val;
  }
  return raw;
};
UUID_VAL_PARSER[CHR_LCD_UUID] = (raw) => {
  if (Buffer.isBuffer(raw) && raw.length <= 16) {
    let val = '';
    for (let i = 0; i < raw.length; i++) {
      let c = LCD_CHAR_TABLE[raw[i]];
      if (!c) {
        continue;
      } else if (Array.isArray(c)) {
        val += c[0];
      } else {
        val += c;
      }
    }
    return val;
  }
  return raw;
};
UUID_VAL_PARSER[CHR_PWM_UUID] = (raw) => {
  if (Buffer.isBuffer(raw) && raw.length === 3) {
    let val = {};
    for (let i = 1; i <= 3; i++) {
      let pwm = raw[i - 1];
      val['pwm' + i] = pwm;
    }
    return val;
  }
  return raw;
};

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
  return new Buffer(0);
}

function strToBuffer(str) {
  if (!str) {
    return new Buffer();
  }
  let i;
  let buf = [];
  for (i = 0; i < str.length; i++) {
    let c = LCD_CHAR_TABLE_REV[str.charAt(i)];
    if (c) {
      buf.push(c);
    }
  }
  return new Buffer(buf);
}

function writeDataFunc(characteristics) {
  return (uuid, val) => {
    if (uuid === CHR_LCD_UUID) {
      if (val) {
        findChr(CHR_LCD_UUID, characteristics).write(strToBuffer(val), true);
      }
    } else if (uuid === CHR_INTERVAL_UUID) {
      val = parseInt(val);
      if (val > 0) {
        findChr(CHR_INTERVAL_UUID, characteristics).write(valToBuffer(val), true);
      }
    } else if (uuid === CHR_DOUT_UUID) {
      val = parseInt(val) & 0xFF;
      if (val > 0) {
        findChr(CHR_DOUT_UUID, characteristics).write(valToBuffer(val), true);
      }
    } else if (uuid === CHR_PWM_UUID) {
      val = parseInt(val) & 0xFFFFFF;
      if (val > 0) {
        findChr(CHR_PWM_UUID, characteristics).write(valToBuffer(val), true);
      }
    }
  };
}

function readDataFunc(characteristics) {
  return (uuid) => {
    findChr(uuid, characteristics).read();
  };
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
        peripheral.writeData = writeDataFunc(characteristics);
        peripheral.readData = readDataFunc(characteristics);
        // write init params
        if (peripheral.nodes && peripheral.nodes.length > 0) {
          let config = peripheral.nodes[0].bleioNode;
          peripheral.writeData(CHR_INTERVAL_UUID, config.initInterval);
          peripheral.writeData(CHR_LCD_UUID, config.initLcd);
          peripheral.writeData(CHR_DOUT_UUID, config.initDout);
          peripheral.writeData(CHR_PWM_UUID, config.initPwm);
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
              c.on('data', (data) => {
                if (peripheral && peripheral.nodes) {
                  peripheral.nodes.forEach((node) => {
                    if (node.in) {
                      node.send({
                        payload: {
                          type: UUID_TO_TYPE[uuid],
                          val: UUID_VAL_PARSER[uuid](data)
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
                if (node.in) {
                  peripheral.readData(uuid);
                } else {
                  peripheral.writeData(uuid, v.val);
                }
              });
            });
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
    if (peripheral && peripheral.nodes) {
      peripheral.nodes.forEach((node) => {
        node.emit('closed');
      });
    }
    if (!peripheral.terminated) {
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
        Object.keys(nodes).forEach((address) => {
          Object.keys(nodes[address]).forEach((nodeId) => {
            nodes[address][nodeId].emit('closed');
          });
        });
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
          } else {
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
    } else {
      peripheral.disconnect() // will re-connect
    }
  }
  delete periphNodes[address][node.id];
  return true;
}

export function clear() {
  // do nothing
}
