# JSUnitSaucelabs

[![npm version](https://img.shields.io/npm/v/jsunitsaucelabs.svg)](https://www.npmjs.com/package/jsunitsaucelabs)
[![dependencies Status](https://img.shields.io/david/Johann-S/JSUnitSaucelabs.svg)](https://david-dm.org/Johann-S/JSUnitSaucelabs)
[![devDependencies Status](https://img.shields.io/david/dev/Johann-S/JSUnitSaucelabs.svg)](https://david-dm.org/Johann-S/JSUnitSaucelabs?type=dev)
[![Build Status](https://img.shields.io/travis/Johann-S/JSUnitSaucelabs/master.svg)](https://travis-ci.org/Johann-S/JSUnitSaucelabs)

Allows you to run your unit tests through Sauce Labs API without Grunt.

## Used by

If you want to add your project here do not hesitate to open a PR :wink:

- [Bootstrap](https://github.com/twbs/bootstrap)

## Install

```shell
npm install jsunitsaucelabs --save-dev
```

## Methods

### Constructor

JSUnitSaucelabs constructor accepts the following parameters (the following are the default values):

```js
{
  username:    null,
  password:    null,
  tunneled:    true,
  build:       null,
  verbose:     false,
  verboseMode: null, // accept : "debug", "info", "warn"
  hostname:    'saucelabs.com',
  base:        '/rest/v1/'
}
```

### JSUnitSaucelabs.prototype.initTunnel

This method allows you to initialise a tunnel between you and Sauce Labs, when this tunnel is started,
JSUnitSaucelabs will emit `tunnelCreated` event

> JSUnitSaucelabs inherit from `EventEmitter`

### JSUnitSaucelabs.prototype.start

This method uses `:username/js-tests` from Sauce Labs API.
See [here](https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-StartJSUnitTests).

#### Parameters

- `platforms`: Array of platforms
- `url`: should point to the page that hosts your tests
- `framework`: the framework used for your tests (QUnit, Jasmine, ...)
- `callback`: function to handle error or success `callback(error, result)`

> If you use a tunnel between Sauce Labs and you, you shouldn't call start before the connection
is established (see `initTunnel` method)

### JSUnitSaucelabs.prototype.getStatus

This method uses `:username/js-tests/status` from Sauce Labs API.
See [here](https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-GetJSUnitTestStatus).

#### Parameters

- `taskIds`: Array of task IDs returned by Sauce Labs API
- `callback`: function to handle error or success `callback(error, result)`

### JSUnitSaucelabs.prototype.stop

Allows you to stop the tunnel between you and Sauce Labs

## Usage Example

```js
var JSUnitSaucelabs = require('jsunitsaucelabs')

var jsUnitSaucelabs = new JSUnitSaucelabs({
  username: 'your-saucelabs-username',
  password: 'your-saucelabs-api-key'
})

var testURL = 'http://localhost/index.html?hidepassed'

jsUnitSaucelabs.on('tunnelCreated', function () {
  jsUnitSaucelabs.start([
    ['Windows 8', 'internet explorer', '10']/*,
    ['OS X 10.8', 'safari', '6']*/
  ], testURL, 'qunit', function (error, success) {
    if (typeof success !== undefined) {
      var taskIds = success['js tests']
      if (!taskIds || !taskIds.length) {
        throw new Error('Error starting tests through Sauce Labs API')
      }

      var waitingCallback = function (error, success) {
        if (error) {
          console.error(error)
          return
        }

        if (typeof success !== 'undefined') {
          if (!success.completed) {
            jsUnitSaucelabs.getStatus(taskIds[0], waitingCallback)
          } else {
            var test = success['js tests'][0]
            var passed = false
            if (test.result !== null) {
              passed = test.result.total === test.result.passed
            }
            console.log('Tested ' + testURL)
            console.log('Platform: ' + test.platform.join(','))
            console.log('Passed: ' + passed.toString())
            console.log('Url ' + test.url)
          }
        }
      }

      taskIds.forEach(function (id) {
        jsUnitSaucelabs.getStatus(id, waitingCallback)
      })
    }
  })
})

jsUnitSaucelabs.initTunnel()
```

## License

[MIT](https://github.com/Johann-S/JSUnitSaucelabs/blob/master/LICENSE)
