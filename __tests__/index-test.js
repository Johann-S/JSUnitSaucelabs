const JSUnitSaucelabs = require('../src/index')
const timeout = 50000

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

test('Allow to create tunnel on SauceLabs', function (done) {
  var successFunction = function () {
    expect(true).toBe(true)
    done()
  }

  // only run this test on Travis
  if (typeof process.env.SAUCE_USERNAME === 'undefined') {
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
}, timeout)
