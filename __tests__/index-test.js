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
