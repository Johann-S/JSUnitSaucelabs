var JSUnitSaucelabs = require('../index')

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
