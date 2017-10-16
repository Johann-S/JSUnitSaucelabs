var JSUnitSaucelabs = require('../src/index')
var Util            = require('../src/util')

test('allow to pass object in constructor', function () {
  var jsUnitSL = new JSUnitSaucelabs({
    username: 'Johann-S',
    password: 'nice-password'
  })

  expect(jsUnitSL.options.username).toBe('Johann-S')
  expect(jsUnitSL.options.password).toBe('nice-password')
})

test('should not create tunnel if tunneled option === false', function () {
  var jsUnitSL = new JSUnitSaucelabs({
    username: 'Johann-S',
    password: 'nice-password',
    tunneled: false
  })

  jsUnitSL.initTunnel()
  expect(jsUnitSL.tunnel).toBe(false)
})

test('Util.formatArray should format correctly input array', function () {
  var testArr1 = ['internet explorer', 'Windows 7', 'ie9']
  testArr1 = Util.formatArray(testArr1)

  expect(testArr1).toHaveLength(1)

  function testBadFormats1() {
    Util.formatArray([])
  }

  expect(testBadFormats1).toThrowError('Empty array or not an array')

  function testBadFormats2() {
    Util.formatArray(7)
  }
  expect(testBadFormats2).toThrowError('Empty array or not an array')
})

test('Allow to create tunnel on SauceLabs', function (done) {
  var successFunction = function () {
    expect(true).toBe(true)
    done()
  }

  // only run this test on Travis
  if (typeof process.env.TRAVIS_JOB_ID === 'undefined') {
    successFunction()
    return
  }

  var jsUnitSL = new JSUnitSaucelabs({
    username: process.env.SAUCE_USERNAME,
    password: process.env.SAUCE_ACCESS_KEY,
    build: process.env.TRAVIS_JOB_ID
  })

  jsUnitSL.on('tunnelCreated', function () {
    successFunction()
    jsUnitSL.stop()
  })
  jsUnitSL.initTunnel()
}, 25000)
