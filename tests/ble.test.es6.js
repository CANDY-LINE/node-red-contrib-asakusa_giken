'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import * as ble from '../lib/ble';

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('ble module', () => {
  RED.debug = true;
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    RED._ = sinon.spy();
  });
  afterEach(() => {
    sandbox = sandbox.restore();
  });
  describe('registerDiscoverHandler()', () => {
    it('should not add a new handler if given functions are invalid', () => {
      assert.isFalse(ble.registerDiscoverHandler());
      assert.isFalse(ble.registerDiscoverHandler(function() {}));
      assert.isFalse(ble.registerDiscoverHandler(null, function() {}));
    });
    it('should not add a duplicate accept function', () => {
      assert.isTrue(ble.registerDiscoverHandler(function() {}, function() {}));
      assert.isFalse(ble.registerDiscoverHandler(function() {}, function() {}));
    });
  });
  describe('discoverFunc()', () => {
    it('should return false if an error detected while performing it', () => {
      assert.isFalse(ble.discoverFuncFactory(RED)({
        advertisement: {
          localName: ''
        }
      }));
      assert.isFalse(ble.discoverFuncFactory(RED)({
        advertisement: {
          localName: '\0'
        }
      }));
      assert.isFalse(ble.discoverFuncFactory(RED)({
        advertisement: {
          localName: 'BLECAST_TM\0'
        }
      }));
    });
  });
});
