'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import * as blecast from '../lib/blecast';

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('blecast module', () => {
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
      advertisement: {},
      test: true
    });
    testNode = sandbox.stub({
      send: () => {},
      on: () => {},
      emit: () => {},
      in: false,
      blecastTmNode: {
        localName: 'BLECAST_TM',
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
  describe('regisetrIn', () => {
    it('should register a node to peripheralsIn[category]', done => {
      blecast.registerIn(testNode, 'BLECAST_TM', 'address123', 'uuid123',
        () => { return {}; }, false, RED);
      console.log('<<<<discoverFunc=========================================');
      RED.nodes.getNode.returns(testNode);
      assert.isTrue(blecast.discoverFunc('BLECAST_TM', testPeripheral, RED));
      console.log('>>>>discoverFunc=========================================');
      done();
    });
  });
  describe('removeIn', () => {
    it('should remove the node from peripheralsIn[category]', done => {
      blecast.registerIn({id:1}, 'BLECAST_TM', 'address1', 'uuid1',
        () => {}, false, RED);
      assert.isTrue(blecast.removeIn({id:1}, 'BLECAST_TM', 'address1', 'uuid1', RED));
      assert.isFalse(blecast.removeIn({id:1}, 'BLECAST_TM', 'address1', 'uuid1', RED));
      done();
    });
  });
});
