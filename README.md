Asakusa Giken BLE device Node-RED nodes
===

This project offers the following BLE device nodes manufactured by Asakusa Giken.

1. [BLECAST_TM](https://translate.google.com/translate?hl=en&sl=ja&tl=en&u=http%3A%2F%2Fwww.robotsfx.com%2Frobot%2FBLECAST_TM.html) ... A BLE temperature sensor device
1. [BLECAST_BL](https://translate.google.com/translate?hl=en&sl=ja&tl=en&u=http%3A%2F%2Fwww.robotsfx.com%2Frobot%2FBLECAST_BL.html) ... A BLE illuminance sensor device

浅草ギ研 BLECAST Node-RED ノード
===

浅草ギ研 BLECASTの以下のデバイスに対応したNode-REDノードです。

1. [BLECAST_TM](http://www.robotsfx.com/robot/BLECAST_TM.html) ... BLE 温度センサー
1. [BLECAST_BL](http://www.robotsfx.com/robot/BLECAST_BL.html) ... BLE 照度センサー

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

* 1.2.0
    - Reset BLE address cache on deploying nodes

* 1.1.0
    - Fix an issue where registered BLE peripherals are remained after the corresponding nodes are gone
    - Update git repo URLs


* 1.0.1
    - Initial public release

# Copyright and License

PNG images under icon folder are released under [CC BY-NC-SA](http://creativecommons.org/licenses/by-nc-sa/4.0/), copyright 2016 [Robotma.com](http://www.robotma.com).

The project is released under MIT License. See LICENSE for detail.
