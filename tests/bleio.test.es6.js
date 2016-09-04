'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import * as bleio from '../lib/bleio';

const BLEIO_CHARS = [
  {
    subscribe: () => {},
    on: () => {},
    notify: () => {},
    uuid:'feedaa02594246d5ade581c064d03a03',
    name:null,
    type:null,
    properties:[
      'read',
      'write'
    ],
    descriptors:null,
  },
  {
    subscribe: () => {},
    on: () => {},
    notify: () => {},
    uuid:'feedaa03594246d5ade581c064d03a03',
    name:null,
    type:null,
    properties:[
      'read',
      'write'
    ],
    descriptors:null
  },
  {
    subscribe: () => {},
    on: () => {},
    notify: () => {},
    uuid:'feedaa04594246d5ade581c064d03a03',
    name:null,
    type:null,
    properties:[
      'read',
      'notify'
    ],
    descriptors:null
  },
  {
    subscribe: () => {},
    on: () => {},
    notify: () => {},
    uuid:'feedaa05594246d5ade581c064d03a03',
    name:null,
    type:null,
    properties:[
      'read',
      'notify'
    ],
    descriptors:null
  },
  {
    subscribe: () => {},
    on: () => {},
    notify: () => {},
    uuid:'feedaa06594246d5ade581c064d03a03',
    name:null,
    type:null,
    properties:[
      'read',
      'write'
    ],
    descriptors:null
  },
  {
    subscribe: () => {},
    on: () => {},
    notify: () => {},
    uuid:'feedaa07594246d5ade581c064d03a03',
    name:null,
    type:null,
    properties:[
      'read',
      'write'
    ],
    descriptors:null
  }
];

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('bleio module', () => {
  RED.debug = true;
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    RED._ = sinon.spy();
  });
  afterEach(() => {
    sandbox = sandbox.restore();
  });
  describe('acceptFunc()', () => {
    it('should return true if localName starts with BLEIo_ and its length is 7', () => {
      assert.isTrue(bleio.acceptFunc('BLEIo_0'));
      assert.isTrue(bleio.acceptFunc('BLEIo_F'));
      assert.isFalse(bleio.acceptFunc('BLEIo_01'));
      assert.isFalse(bleio.acceptFunc(''));
      assert.isFalse(bleio.acceptFunc(null));
    });
  });
  describe('registration and removal', () => {
    let testPeripheral;
    let testNode;
    let testPeripheral2;
    let testNode2;
    let characteristics;
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      testPeripheral = sandbox.stub({
        on: () => {},
        removeListener: () => {},
        discoverSomeServicesAndCharacteristics: () => {},
        disconnect: () => {},
        connect: () => {},
        terminate: () => {},
        address: 'CC:5E:66:DD:0B:88',
        test: true
      });
      testNode = sandbox.stub({
        send: () => {},
        emit: () => {},
        in: true,
        bleioNode: {
          localName: 'BLEIo_0',
          address: 'CC:5E:66:DD:0B:88'
        },
        id: '1111'
      });
      testPeripheral2 = sandbox.stub({
        on: () => {},
        removeListener: () => {},
        discoverSomeServicesAndCharacteristics: () => {},
        disconnect: () => {},
        connect: () => {},
        terminate: () => {},
        address: 'FF:5E:66:DD:0B:FF',
        test: true
      });
      testNode2 = sandbox.stub({
        send: () => {},
        emit: () => {},
        in: true,
        bleioNode: {
          localName: 'BLEIo_F',
          address: ''
        },
        id: '2222'
      });
      characteristics = BLEIO_CHARS.map((c) => {
        return sandbox.stub(c);
      });
    });
    afterEach(() => {
      sandbox = sandbox.restore();
    });

    describe('register()', () => {
      it('should register a new node', done => {
        // connect
        testPeripheral.on.onFirstCall().yields(null);
        testPeripheral.discoverSomeServicesAndCharacteristics.yields(
          null, null, characteristics);
        characteristics.forEach((c) => {
          c.subscribe.yields(null);
          // on('data') => node.send()
          c.on.yields(new Buffer('12', 'hex'), true);
        });

        // disconnect
        testPeripheral.on.onSecondCall().yields(null);

        delete testNode.peripheral;
        bleio.register(testNode, RED);
        function waitUntilDone() {
          if (testNode.peripheral) {
            assert.equal(2, characteristics.filter((c) => {
              return c.subscribed;
            }).length);
            assert.isTrue(testNode.send.called);
            return done();
          }
          setTimeout(waitUntilDone, 1000);
        }
        setTimeout(() => {
          bleio.discoverFunc('BLEIo_0', testPeripheral, RED);
          waitUntilDone();
        }, 2000);
      }).timeout(10000);
      it('should register a new node with wildcard', done => {
        delete testNode2.peripheral;
        bleio.register(testNode2, RED);
        function waitUntilDone() {
          if (testNode2.peripheral) {
            return done();
          }
          setTimeout(waitUntilDone, 1000);
        }
        setTimeout(() => {
          bleio.discoverFunc('BLEIo_F', testPeripheral2, RED);
          waitUntilDone();
        }, 2000);
      }).timeout(10000);
    });
  });
});

describe('registration and removal without stub', () => {
  let testPeripheral = {
    on: () => {},
    removeListener: () => {},
    discoverSomeServicesAndCharacteristics: () => {},
    disconnect: () => {},
    connect: () => {},
    terminate: () => {},
    address: 'CC:5E:66:DD:0B:88',
    test: true
  };
  let testNode = {
    emit: () => {},
    bleioNode: {
      localName: 'BLEIo_0',
      address: 'CC:5E:66:DD:0B:88'
    },
    id: '1111'
  };
  let testPeripheral2 = {
    on: () => {},
    discoverSomeServicesAndCharacteristics: () => {},
    disconnect: () => {},
    connect: () => {},
    terminate: () => {},
    address: 'FF:5E:66:DD:0B:FF',
    test: true
  };
  let testNode2 = {
    emit: () => {},
    bleioNode: {
      localName: 'BLEIo_F',
      address: ''
    },
    id: '2222'
  };
  describe('register()', () => {
    it('should register a new node', done => {
      delete testNode.peripheral;
      bleio.register(testNode, RED);
      function waitUntilDone() {
        if (testNode.peripheral) {
          return done();
        }
        setTimeout(waitUntilDone, 1000);
      }
      setTimeout(() => {
        bleio.discoverFunc('BLEIo_0', testPeripheral, RED);
        waitUntilDone();
      }, 2000);
    }).timeout(10000);
    it('should register a new node with wildcard', done => {
      delete testNode2.peripheral;
      bleio.register(testNode2, RED);
      function waitUntilDone() {
        if (testNode2.peripheral) {
          return done();
        }
        setTimeout(waitUntilDone, 1000);
      }
      setTimeout(() => {
        bleio.discoverFunc('BLEIo_F', testPeripheral2, RED);
        waitUntilDone();
      }, 2000);
    }).timeout(10000);
  });
  describe('remove()', () => {
    it('should remove the existing node', done => {
      assert.isDefined(testNode.peripheral); // defined by register()
      assert.isTrue(bleio.remove(testNode, RED));
      function waitUntilDone() {
        if (!testNode.peripheral) {
          done();
        }
        setTimeout(waitUntilDone, 1000);
      }
      waitUntilDone();
    }).timeout(10000);
  });
});
