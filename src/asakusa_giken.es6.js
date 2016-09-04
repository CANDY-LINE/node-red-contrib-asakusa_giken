'use strict';
/*
 * BLECAST_BL (BLE with Illuminance Sensor) node
 * BLECAST_TM (BLE with Temeprature Sensor) node
 */

import * as ble from './ble';
import * as blecast from './blecast';
import * as blecastBl from './blecast_bl';
import * as blecastTm from './blecast_tm';
import * as bleio from './bleio';

export default function(RED) {
  let p = ble.start(RED).then(() => {

    // BLEIo
    ble.registerDiscoverHandler(bleio.acceptFunc, bleio.discoverFunc);
    class BLEIoNode {
      constructor(n) {
        RED.nodes.createNode(this, n);
        this.localName = n.localName;
        this.address = n.address; // can be empty
        this.uuid = n.uuid; // can be empty
        this.initInterval = n.initInterval;
        this.initDout = n.initDout;
        this.initLcd = n.initLcd;
        this.initPwm = n.initPwm;
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
