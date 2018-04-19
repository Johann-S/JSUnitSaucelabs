/* eslint-env jest */

const Util = require('../src/util')

test('Util.formatArray should format correctly input array', () => {
  let testArr1 = ['internet explorer', 'Windows 7', 'ie9']
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

test('Util.isArray', () => {
  expect(Util.isArray([])).toBeTruthy()
  expect(Util.isArray('array')).toBeFalsy()
})

test('Util.replace should replace sub string', () => {
  const str = 'http://lalala/:username/'
  const expectedStr = 'http://lalala/johann-s/'

  const result = Util.replace(str, {
    username: 'johann-s'
  })

  expect(result).toEqual(expectedStr)
})
