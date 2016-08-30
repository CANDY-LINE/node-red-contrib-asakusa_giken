'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import * as bleio from '../lib/bleio';

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('blecast module', () => {
  RED.debug = true;
	let sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
    RED._ = sinon.spy();
	});
	afterEach(() => {
		sandbox = sandbox.restore();
	});
	describe('removeIn', () => {
    it('should remove node from peripheralsIn[category]', done => {
			assert.isUndefined(bleio.remove());
			done();
		});
	});
});
