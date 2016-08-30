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
	describe('discoverFunc()', () => {
		it('should return false if an error detected while performing it', done => {
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
			done();
		});
	});
	describe('removeIn', () => {
    it('should remove node from peripheralsIn[category]', done => {
			ble.registerIn({id:1}, 'BLECAST_TM', 'address1', 'uuid1',
				() => {}, false, RED);
			assert.isTrue(ble.removeIn({id:1}, 'BLECAST_TM', 'address1', 'uuid1', RED));
			assert.isFalse(ble.removeIn({id:1}, 'BLECAST_TM', 'address1', 'uuid1', RED));
			done();
		});
	});
});
