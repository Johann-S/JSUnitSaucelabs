# JSUnitSaucelabs

Allows you to run your unit tests through Sauce Labs API without Grunt.

## Install

```shell
npm install jsunitsaucelabs
```

## Methods

### JSUnitSaucelabs.prototype.start

This method uses `:username/js-tests` from Sauce Labs API.
See [https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-StartJSUnitTests](https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-StartJSUnitTests)

#### Parameters

- `platforms`: Array of platforms
- `url`: should point to the page that hosts your tests
- `framework`: the framework is used for your tests (QUnit, Jasmine, ...)
- `callback`: function to handle error or success `callback(error, result)`

### JSUnitSaucelabs.prototype.getStatus

This method uses `:username/js-tests/status` from Sauce Labs API.
See [https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-GetJSUnitTestStatus](https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-GetJSUnitTestStatus)

#### Parameters

- `taskIds`: Array of task ID returned by Sauce Labs API
- `callback`: function to handle error or success `callback(error, result)`

## How to use it with an example

```js
var JSUnitSaucelabs = require('./jsUnitSaucelabs')

var jsUnitSaucelabs = new JSUnitSaucelabs({
  username: 'your-saucelabs-username',
  password: 'your-saucelabs-api-key'
})

var testURL = 'http://localhost/index.html?hidepassed'
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
```
