'use strict';

import noble from 'noble';
import Promise from 'es6-promises';

let isScanning = false;
let isMonitoring = false;
let discoverHandlers = [];
let stateChangeHandler;
let discoverHandler;

export function isScanning() {
  return isScanning;
}

export function isMonitoring() {
  return isMonitoring;
}

export function registerDiscoverHandler(acceptFunc, discoverFunc) {
  if (!acceptFunc || !discoverFunc) {
    return false;
  }
  for (i in discoverHandlers) {
    if (discoverHandlers[i].accept.toString() === acceptFunc.toString()) {
      return false;
    }
  }
  discoverHandlers.push({
    accept: acceptFunc,
    discover: discoverFunc
  });
  return true;
}

export function discoverFuncFactory(RED) {
  return function(peripheral) {
    let adv = peripheral.advertisement;
    if (!adv.localName) {
      return false;
    }
    // Remove a NULL terminator
    let categoryName = adv.localName.replace(new RegExp('\0', 'g'), '');
    if (!categoryName) {
      return false;
    }
    discoverHandlers.forEach(h => {
      if (h.accept(categoryName)) {
        return h.discover(categoryName, peripheral, RED);
      }
    });
    return false; // Unknown category name
  };
}

/**
 * Stop the BLE module immediately.
 * @param RED the initialized RED object
 * @return void (sync)
 */
export function stop(RED) {
  noble.stopScanning();
  isScanning = false;
  if (RED && RED._) {
    RED.log.info(RED._('asakusa_giken.message.stop-scanning'));
  }
}

/**
 * Start the BLE module.
 * @param RED the initialized RED object
 * @return Promise
 */
export function start(RED) {
  if (!RED) {
    throw new Error('RED is required!');
  }
  let handlers = RED.settings.exitHandlers;
  if (handlers && handlers.indexOf(stop) < 0) {
    handlers.push(stop);
  } else {
    handlers = [stop];
    try {
      RED.settings.exitHandlers = handlers;
    } catch (_) {
      // ignore
    }
  }
  return new Promise(resolve => {
    if (isScanning) {
      return resolve();
    }
    if (stateChangeHandler) {
      noble.removeListener('stateChange', stateChangeHandler);
    }
    stateChangeHandler = (state) => {
      if (state === 'poweredOn') {
        if (!isScanning) {
          RED.log.info(RED._('asakusa_giken.message.start-scanning'));
          noble.on('scanStop', function () {
            setTimeout(function () {
              noble.startScanning([], true, (err) => {
                if (err) {
                  RED.log.info(RED._('asakusa_giken.errors.unknown', {error: err}));
                }
              });
            }, 2500);
          });
          noble.startScanning([], true);
          isScanning = true;
        }
      } else {
        noble.stopScanning();
        isScanning = false;
        RED.log.info(RED._('asakusa_giken.message.stop-scanning'));
      }
    };
    noble.on('stateChange', stateChangeHandler);
    if (!isScanning && noble.state === 'poweredOn') {
      RED.log.info(RED._('asakusa_giken.message.start-scanning'));
      noble.startScanning([], true);
      isScanning = true;
    }
    resolve();
  }).then(() => {
    return new Promise(resolve => {
      if (isMonitoring) {
        return resolve();
      }
      isMonitoring = true;
      if (discoverHandler) {
        noble.removeListener('discover', discoverHandler);
      }
      discoverHandler = discoverFuncFactory(RED);
      noble.on('discover', discoverHandler);
      resolve();
      RED.log.info(RED._('asakusa_giken.message.setup-done'));
    });
  });
}
