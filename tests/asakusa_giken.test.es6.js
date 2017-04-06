'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import asakusaGikenModule from '../lib/asakusa_giken';
import * as bleenv from '../lib/bleenv';

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('asakusa_giken node', () => {
  RED.debug = true;
	let sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
    RED._ = sinon.spy();
	});
	afterEach(() => {
		sandbox = sandbox.restore();
	});
  describe('bleenv module', () => {
    it('should be able to clear caches', () => {
      bleenv.clear(RED);
    });
  });
  describe('asakusa_giken module', () => {
    it('should have valid Node-RED plugin classes', done => {
      assert.isNotNull(RED);
      asakusaGikenModule(RED).then(() => {
        assert.isNotNull(RED.nodes.getType('BLECAST_ENV').name);
        assert.isNotNull(RED.nodes.getType('BLECAST_ENV in').name);
        assert.isNotNull(RED.nodes.getType('BLEIo').name);
        assert.isNotNull(RED.nodes.getType('BLEIo in').name);
        assert.isNotNull(RED.nodes.getType('BLEIo out').name);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
