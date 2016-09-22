'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import * as bleenv from '../lib/bleenv';

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('bleenv module', () => {
  RED.debug = true;
  let sandbox;
  let testPeripheral;
  let testNode;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    testPeripheral = sandbox.stub({
      on: () => {},
      removeListener: () => {},
      discoverSomeServicesAndCharacteristics: () => {},
      disconnect: () => {},
      connect: () => {},
      terminate: () => {},
      address: 'address123',
      uuid: 'uuid123',
      advertisement: {
        manufacturerData: [0, 1, 2, 3, 4, 5, 6] // 7 bytes
      },
      test: true
    });
    testNode = sandbox.stub({
      send: () => {},
      on: () => {},
      emit: () => {},
      bleenvNode: {
        localName: 'ENV_0',
        address: 'address123'
      },
      id: '1111'
    });
    RED._ = sinon.spy();
    RED.nodes = sandbox.stub({
      getNode: () => {}
    });
  });
  afterEach(() => {
    sandbox = sandbox.restore();
  });
  describe('regisetr', () => {
    it('should register a node to peripheralsIn[category]', done => {
      bleenv.register(testNode, RED);
      console.log('<<<<discoverFunc=========================================');
      assert.isTrue(bleenv.discoverFunc('ENV_0', testPeripheral, RED));
      assert.isTrue(testNode.send.called);
      console.log('>>>>discoverFunc=========================================');
      done();
    });
  });
  describe('remove', () => {
    it('should remove the node from peripheralsIn[category]', done => {
      bleenv.register(testNode, RED);
      assert.isTrue(bleenv.remove(testNode, RED));
      assert.isFalse(bleenv.remove(testNode, RED));
      done();
    });
  });
});
