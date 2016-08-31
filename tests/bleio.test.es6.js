'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import * as bleio from '../lib/bleio';

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
		let testPeripheral = {
			on: () => {},
			discoverAllServicesAndCharacteristics: () => {},
			disconnect: () => {},
			connect: () => {},
			address: 'CC:5E:66:DD:0B:88',
			test: true
		};
		let testNode = {
			bleioNode: {
				localName: 'BLEIo_0',
				address: 'CC:5E:66:DD:0B:88'
			},
			id: '1111'
		};
		let testPeripheral2 = {
			on: () => {},
			discoverAllServicesAndCharacteristics: () => {},
			disconnect: () => {},
			connect: () => {},
			address: 'FF:5E:66:DD:0B:FF',
			test: true
		};
		let testNode2 = {
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
				bleio.remove(testNode, RED);
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
});
