'use strict';

import * as ble from './ble';
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

        this.on('close', (done) => {
          if (this.bleioNode) {
            bleio.remove(this, done, RED);
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

        this.on('close', (done) => {
          if (this.bleioNode) {
            bleio.remove(this, done, RED);
          }
        });
        bleio.clear(RED);
      }
    }
    RED.nodes.registerType('BLEIo out', BLEIoOutNode);
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
