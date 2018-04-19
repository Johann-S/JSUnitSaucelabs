'use strict'

const https = require('https')

const Util = {
  extend: function (obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function (props) {
      for (const prop in props) {
        if (Object.prototype.hasOwnProperty.call(props, prop)) {
          obj[prop] = props[prop]
        }
      }
    })
    return obj
  },

  replace: (str, values) => {
    let name = null
    let value = null

    for (name in values) {
      if (Object.prototype.hasOwnProperty.call(values, name)) {
        value = values[name]
        str = str.replace(new RegExp(':' + name, 'g'), value)
      }
    }
    return str
  },

  isArray: obj => Object.prototype.toString.call(obj) === '[object Array]',

  request: (config, callback, verbose, verboseMode) => {
    const body = JSON.stringify(config.data)
    const requestConfig = {
      method: config.method,
      host: config.host,
      path: config.path,
      auth: config.auth,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }

    const codeRequestSuccess = 200
    const request = https.request(requestConfig, (response) => {
      let result = ''
      if (callback) {
        response.on('data', (chunk) => {
          result += chunk
        })
        .on('end', () => {
          let res = null
          try {
            res = JSON.parse(result)
          } catch (e) {
            callback('Could not parse response: ' + result)
            return
          }

          if (response.statusCode === codeRequestSuccess) {
            callback(null, res)
          } else {
            callback(res)
          }
        })
      }
    })
    .on('error', (err) => {
      if (callback) {
        callback('Could not send request: ' + err.message)
      }
      if (verbose) {
        Util.logWarn('Could not send request: ' + err.message, verboseMode)
      }
    })

    request.write(body)
    request.end()
  },

  formatArray: (arr) => {
    if (!Util.isArray(arr) || Util.isArray(arr) && arr.length === 0) {
      throw new Error('Empty array or not an array')
    }

    if (!Util.isArray(arr[0])) {
      arr = [arr]
    }
    return arr
  }
}

module.exports = Util
