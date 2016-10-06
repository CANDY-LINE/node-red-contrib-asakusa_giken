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
    write: () => {},
    read: () => {},
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
    write: () => {},
    read: () => {},
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
    write: () => {},
    read: () => {},
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
    write: () => {},
    read: () => {},
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
    write: () => {},
    read: () => {},
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
    write: () => {},
    read: () => {},
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
    bleio.reset();
  });
  afterEach(() => {
    sandbox = sandbox.restore();
  });
  describe('valToBuffer()', () => {
    it('should translate a numeric number into a buffer', () => {
      assert.deepEqual(new Buffer([0x0A]), bleio.valToBuffer(10));
      assert.deepEqual(new Buffer([0x00, 0x0A]), bleio.valToBuffer(10, 2));
      assert.deepEqual(new Buffer([0x01, 0xF4]), bleio.valToBuffer(500));
      assert.deepEqual(new Buffer([0x01, 0xF4]), bleio.valToBuffer(500, 2));
      assert.deepEqual(new Buffer([0x10]), bleio.valToBuffer(16));
      assert.deepEqual(new Buffer([0x00, 0x10]), bleio.valToBuffer(16, 2));
    });
    it('should translate a hex number into a buffer', () => {
      assert.deepEqual(new Buffer([0x0A]), bleio.valToBuffer('a'));
      assert.deepEqual(new Buffer([0x00, 0x0A]), bleio.valToBuffer('a', 2));
      assert.deepEqual(new Buffer([0x10]), bleio.valToBuffer('10'));
      assert.deepEqual(new Buffer([0x00, 0x10]), bleio.valToBuffer('10', 2));
    });
    it('should translate an int array into a buffer', () => {
      assert.deepEqual(new Buffer([0x0A]), bleio.valToBuffer([10]));
      assert.deepEqual(new Buffer([0x00, 0x0A]), bleio.valToBuffer([10], 2));
      assert.deepEqual(new Buffer([0x10]), bleio.valToBuffer([16]));
      assert.deepEqual(new Buffer([0x00, 0x10]), bleio.valToBuffer([16], 2));
    });
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
      bleio.reset();
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
        removeAllListeners: () => {},
        send: () => {},
        on: () => {},
        emit: () => {},
        in: false,
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
        removeAllListeners: () => {},
        send: () => {},
        on: () => {},
        emit: () => {},
        in: true,
        bleioNode: {
          localName: 'BLEIo_F',
          address: ''
        },
        id: '2222'
      });
      characteristics = BLEIO_CHARS.map((c) => {
        c.subscribed = false;
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
        // node.on()
        testNode.on.yields({
          payload: {
            type: 'DIN'
          }
        });

        // disconnect
        testPeripheral.on.onSecondCall().yields(null);

        delete testNode.peripheral;
        bleio.register(testNode, RED);
        function waitUntilDone() {
          if (testNode.peripheral) {
            assert.equal(6, characteristics.filter((c) => {
              return c.subscribed;
            }).length);
            assert.equal(1, characteristics.filter((c) => {
              return c.read.called;
            }).length);
            assert.isFalse(testNode.send.called);
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
        // connect
        testPeripheral2.on.onFirstCall().yields(null);
        testPeripheral2.discoverSomeServicesAndCharacteristics.yields(
          null, null, characteristics);
        characteristics.forEach((c) => {
          c.subscribe.yields(null);
          // on('data') => node.send()
          c.on.yields(new Buffer('12', 'hex'), true);
        });

        // disconnect
        testPeripheral2.on.onSecondCall().yields(null);

        delete testNode2.peripheral;
        console.log('<<<<register=========================================');
        bleio.register(testNode2, RED);
        function waitUntilDone() {
          if (testNode2.peripheral) {
            console.log('>>>register=========================================');
            assert.isTrue(testNode2.send.called);
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
    removeAllListeners: () => {},
    on: () => {},
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
    removeAllListeners: () => {},
    on: () => {},
    emit: () => {},
    bleioNode: {
      localName: 'BLEIo_F',
      address: ''
    },
    id: '2222'
  };
  before(() => {
    bleio.reset();
  });
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
