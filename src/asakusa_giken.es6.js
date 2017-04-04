'use strict';

import * as ble from './ble';
import * as blecast from './blecast';
import * as blecastBl from './blecast_bl';
import * as blecastTm from './blecast_tm';
import * as bleio from './bleio';
import * as bleenv from './bleenv';

export default function(RED) {
  let p = ble.start(RED).then(() => {

    // BLECAST_ENV
    ble.registerDiscoverHandler(bleenv.acceptFunc, bleenv.discoverFunc);
    class BLEEnvNode {
      constructor(n) {
        RED.nodes.createNode(this, n);
        this.localName = n.localName;
        this.address = n.address; // can be empty
      }
    }
    RED.nodes.registerType('BLECAST_ENV', BLEEnvNode);

    class BLEEnvInNode {
      constructor(n) {
        RED.nodes.createNode(this, n);
        this.useString = n.useString;
        this.bleenvNodeId = n.bleenv;
        this.bleenvNode = RED.nodes.getNode(this.bleenvNodeId);
        if (this.bleenvNode) {
          bleenv.register(this, RED);
        }
        this.name = n.name;

        this.on('close', () => {
          if (this.bleenvNode) {
            bleenv.remove(this, RED);
          }
        });
        bleenv.clear(RED);
      }
    }
    RED.nodes.registerType('BLECAST_ENV in', BLEEnvInNode);

    // BLEIo
    ble.registerDiscoverHandler(bleio.acceptFunc, bleio.discoverFunc);
    class BLEIoNode {
      constructor(n) {
        RED.nodes.createNode(this, n);
        this.localName = n.localName;
        this.address = n.address; // can be empty
        this.initInterval = n.initInterval;
        this.initDout = {};
        for (let i = 1; i <= 8; i++) {
          this.initDout[`dout${i}`] = n[`initDout${i}`];
        }
        this.initLcd = n.initLcd;
        this.initPwm = {
          pwm1: n.initPwm1,
          pwm2: n.initPwm2,
          pwm3: n.initPwm3
        };
      }
    }
    RED.nodes.registerType('BLEIo', BLEIoNode);

    class BLEIoInNode {
      constructor(n) {
        RED.nodes.createNode(this, n);
        this.in = true;
        this.peripheral = null;
        this.useString = n.useString;
        this.bleioNodeId = n.bleio;
        this.bleioNode = RED.nodes.getNode(this.bleioNodeId);
        if (this.bleioNode) {
          bleio.register(this, RED);
          this.on('opened', () => { this.status({fill:'green',shape:'dot',text:'asakusa_giken.status.connected'}); });
          this.on('erro',  () => { this.status({fill:'red',shape:'ring',text:'asakusa_giken.status.error'}); });
          this.on('closed',  () => { this.status({fill:'red',shape:'ring',text:'asakusa_giken.status.disconnected'}); });
        }
        this.name = n.name;

        this.on('close', () => {
          if (this.bleioNode) {
            bleio.remove(this, RED);
          }
        });
        bleio.clear(RED);
      }
    }
    RED.nodes.registerType('BLEIo in', BLEIoInNode);

    class BLEIoOutNode {
      constructor(n) {
        RED.nodes.createNode(this, n);
        this.in = false;
        this.peripheral = null;
        this.useString = n.useString;
        this.bleioNodeId = n.bleio;
        this.bleioNode = RED.nodes.getNode(this.bleioNodeId);
        if (this.bleioNode) {
          bleio.register(this, RED);
          this.on('opened', () => { this.status({fill:'green',shape:'dot',text:'asakusa_giken.status.connected'}); });
          this.on('erro',  () => { this.status({fill:'red',shape:'ring',text:'asakusa_giken.status.error'}); });
          this.on('closed',  () => { this.status({fill:'red',shape:'ring',text:'asakusa_giken.status.disconnected'}); });
        }
        this.name = n.name;

        this.on('close', () => {
          if (this.bleioNode) {
            bleio.remove(this, RED);
          }
        });
        bleio.clear(RED);
      }
    }
    RED.nodes.registerType('BLEIo out', BLEIoOutNode);

    if (process.env.ASAKUSA_GIKEN_USE_OBSOLETE === 'true') {
      // BLECAST
      ble.registerDiscoverHandler(blecast.acceptFunc, blecast.discoverFunc);
      class BlecastBlNode {
        constructor(n) {
          RED.nodes.createNode(this, n);
          this.address = n.address;
          this.uuid = n.uuid;
        }
      }
      RED.nodes.registerType('BLECAST_BL', BlecastBlNode);

      class BlecastBlInNode {
        constructor(n) {
          RED.nodes.createNode(this, n);
          this.useString = n.useString;
          this.blecastBlNodeId = n.blecastBl;
          this.blecastBlNode = RED.nodes.getNode(this.blecastBlNodeId);
          if (this.blecastBlNode) {
            blecast.registerIn(this, 'BLECAST_BL', this.blecastBlNode.address, this.blecastBlNode.uuid,
              blecastBl.parse, this.useString, RED);
          }
          this.name = n.name;

          this.on('close', () => {
            if (this.blecastBlNode) {
              blecast.removeIn(this, 'BLECAST_BL', this.blecastBlNode.address, this.blecastBlNode.uuid, RED);
            }
          });
          blecast.clear(RED);
        }
      }
      RED.nodes.registerType('BLECAST_BL in', BlecastBlInNode);

      class BlecastTmNode {
        constructor(n) {
          RED.nodes.createNode(this, n);
          this.address = n.address;
          this.uuid = n.uuid;
        }
      }
      RED.nodes.registerType('BLECAST_TM', BlecastTmNode);

      class BlecastTmInNode {
        constructor(n) {
          RED.nodes.createNode(this, n);
          this.useString = n.useString;
          this.blecastTmNodeId = n.blecastTm;
          this.blecastTmNode = RED.nodes.getNode(this.blecastTmNodeId);
          if (this.blecastTmNode) {
            blecast.registerIn(this, 'BLECAST_TM', this.blecastTmNode.address, this.blecastTmNode.uuid,
              blecastTm.parse, this.useString, RED);
          }
          this.name = n.name;

          this.on('close', () => {
            if (this.blecastTmNode) {
              blecast.removeIn(this, 'BLECAST_TM', this.blecastTmNode.address, this.blecastTmNode.uuid, RED);
            }
          });
          blecast.clear(RED);
        }
      }
      RED.nodes.registerType('BLECAST_TM in', BlecastTmInNode);
    }
  });

  // DEBUG
  if (RED.debug) {
    // Should not return anything except for test
    // since Node-RED tries to manipulate the return value unless it's null/undefined
    // and TypeError will be raised in the end.
    return p;
  } else {
    p.catch(e => {
      RED.log.error(RED._('blecast_bl.errors.unknown', { error: e }));
    });
  }
}
