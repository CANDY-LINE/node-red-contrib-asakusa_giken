'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

require('source-map-support/register');

var _sinon = require('sinon');

var sinon = _interopRequireWildcard(_sinon);

var _chai = require('chai');

var _nodeRed = require('node-red');

var _nodeRed2 = _interopRequireDefault(_nodeRed);

var _asakusa_giken = require('../asakusa_giken');

var _asakusa_giken2 = _interopRequireDefault(_asakusa_giken);

var _libBle = require('../lib/ble');

var ble = _interopRequireWildcard(_libBle);

var server = sinon.spy();
var settings = sinon.spy();
_nodeRed2['default'].init(server, settings);

describe('asakusa_giken node', function () {
  _nodeRed2['default'].debug = true;
  var sandbox = undefined;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    _nodeRed2['default']._ = sinon.spy();
  });
  afterEach(function () {
    sandbox = sandbox.restore();
  });
  describe('asakusa_giken module', function () {
    it('should have valid Node-RED plugin classes', function (done) {
      _chai.assert.isNotNull(_nodeRed2['default']);
      (0, _asakusa_giken2['default'])(_nodeRed2['default']).then(function () {
        _chai.assert.isNotNull(_nodeRed2['default'].nodes.getType('BLECAST_BL').name);
        _chai.assert.isNotNull(_nodeRed2['default'].nodes.getType('BLECAST_BL in').name);
        _chai.assert.isNotNull(_nodeRed2['default'].nodes.getType('BLECAST_TM').name);
        _chai.assert.isNotNull(_nodeRed2['default'].nodes.getType('BLECAST_TM in').name);
        ble.stop(_nodeRed2['default']);
        done();
      })['catch'](function (err) {
        done(err);
      });
    });
  });
});
//# sourceMappingURL=asakusa_giken.test.es6.js.map