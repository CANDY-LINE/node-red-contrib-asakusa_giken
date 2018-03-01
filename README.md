Asakusa Giken BLE device Node-RED nodes(Deprecated)
===

[![GitHub release](https://img.shields.io/github/release/CANDY-LINE/node-red-contrib-asakusa_giken.svg)](https://github.com/CANDY-LINE/node-red-contrib-asakusa_giken/releases/latest)
[![master Build Status](https://travis-ci.org/CANDY-LINE/node-red-contrib-asakusa_giken.svg?branch=master)](https://travis-ci.org/CANDY-LINE/node-red-contrib-asakusa_giken/)
[![License MIT](https://img.shields.io/github/license/CANDY-LINE/node-red-contrib-asakusa_giken.svg)](http://opensource.org/licenses/MIT)

**This node won't work with [`nobile@1.9.0`](https://github.com/noble/noble) or higher so you don't use this node along with nodes using the library such as [node-red-contrib-generic-ble](https://flows.nodered.org/node/node-red-contrib-generic-ble). We no longer update this project in order to support [`nobile@1.9.0`](https://github.com/noble/noble) or higher.**

**This project is no longer active.**

This project offers the following BLE device nodes manufactured by Asakusa Giken.

1. [BLEIo](https://translate.google.com/translate?hl=en&sl=ja&tl=en&u=http%3A%2F%2Fwww.robotsfx.com%2Frobot%2FBLEIo.html) ... GPIO BLE board
1. [BLECAST_ENV](https://translate.google.com/translate?hl=en&sl=ja&tl=en&u=http%3A%2F%2Fwww.robotsfx.com%2Frobot%BLECAST_ENV.html) ... A BLE multi-sensor device (temperature, humidity and illuminance)

The following nodes are no longer included:

1. [BLECAST_TM](https://translate.google.com/translate?hl=en&sl=ja&tl=en&u=http%3A%2F%2Fwww.robotsfx.com%2Frobot%2FBLECAST_TM.html) ... A BLE temperature sensor device
1. [BLECAST_BL](https://translate.google.com/translate?hl=en&sl=ja&tl=en&u=http%3A%2F%2Fwww.robotsfx.com%2Frobot%2FBLECAST_BL.html) ... A BLE illuminance sensor device

浅草ギ研 BLECAST Node-RED ノード(Deprecated)
===

**ご注意）[node-red-contrib-generic-ble](https://flows.nodered.org/node/node-red-contrib-generic-ble)ノードなど[`nobile@1.9.0`](https://github.com/noble/noble)以上を利用するノードやライブラリーと併用することはできません。今後[`nobile@1.9.0`](https://github.com/noble/noble)移行に対応する予定はありません**

**ご注意）本プロジェクトは停止しました**

浅草ギ研 BLE対応製品の以下のデバイスに対応したNode-REDノードです。

1. [BLEIo](http://www.robotsfx.com/robot/BLEIo.html) ... 汎用I/O BLEモジュール
1. [BLECAST_ENV](http://www.robotsfx.com/robot/BLECAST_ENV.html) ... BLE温湿度＆照度センサー

以下のノードは、初期設定では使用できません。使用するには、バージョン3のノードをインストールしてください。

1. [BLECAST_TM](http://www.robotsfx.com/robot/BLECAST_TM.html) ... BLE 温度センサー
1. [BLECAST_BL](http://www.robotsfx.com/robot/BLECAST_BL.html) ... BLE 照度センサー


## サンプルフロー

BLEIo向けのサンプルフロー[`example-flow.json`](https://github.com/CANDY-LINE/node-red-contrib-asakusa_giken/blob/master/examples/example-flow.json) が利用可能です。`Import`->`Examples`->`asakusa_giken`->`example-flow`からインポート可能です。

# Install

```
cd ~/.node-red # or your own userDir where Node-RED saves flow file
npm install --unsafe-perm node-red-contrib-asakusa_giken
```

# Development

## Tools

Then, try this.
```
$ npm install --unsafe-perm
```

## How to build

```
$ npm run build
```
will generate ES5 js files.

# Revision History
* 4.0.5
    - Fix noble version as noble v1.9.0+ is no longer supported
    - Make this project deprecated as we stop the development of this project

* 4.0.4
    - Fix an issue where TimeoutError can be thrown when valid BLE peripherals are missing

* 4.0.3
    - Invoke done() callback at least one associated peripheral exists

* 4.0.2
    - Fix an issue where done cannot be invoked when the peripheral is already disconnected

* 4.0.1
    - Fix an issue where BLE termination cannot be performed while 'close' event
    - Fix an issue where localName cannot be resumed

* 4.0.0
    - Remove Node.js v0.12 support
    - Remove [BLECAST_TM](http://www.robotsfx.com/robot/BLECAST_TM.html) node and [BLECAST_BL](http://www.robotsfx.com/robot/BLECAST_BL.html) node

* 3.x
    - See 3.x branch for future 3.x releases

* 3.0.4
    - Remove redundant dependency

* 3.0.3
    - Fix an issue where BLE scanning stopped after connecting to a BLE peripheral

* 3.0.2
    - Fix an issue where node events weren't occasionally transmitted to configuration nodes

* 3.0.1
    - Fix an issue where LCD showed dot characters as blank spaces
    - Fix an issue where some of DOUT and PWM values weren't applied properly
    - Improve the example flow

* 3.0.0
    - Add a new node for BLECAST_ENV

* 2.0.4
    - Fix an issue where BLEIo node failed to write a valid value because of wrong value translation

* 2.0.3
    - Fix an issue where blecast module threw undefined error

* 2.0.2
    - Fix an issue where Chrome browser failed to evaluate variable declarations because of a lack of 'use restrict'
    - Fix an issue where BLECAST_BL and BLECAST_TM descriptions were missing

* 2.0.1
    - Fix an issue where noble with Bluez didn't fire a discover event once a peripheral was connected

* 2.0.0
    - Add a new node for BLEIo

* 1.2.0
    - Reset BLE address cache on deploying nodes

* 1.1.0
    - Fix an issue where registered BLE peripherals are remained after the corresponding nodes are gone
    - Update git repo URLs


* 1.0.1
    - Initial public release

# Copyright and License

PNG images under icon folder are released under [CC BY-NC-SA](http://creativecommons.org/licenses/by-nc-sa/4.0/), copyright 2017 [CANDY LINE INC.](http://www.candy-line.io).

The project is released under MIT License. See LICENSE for detail.
