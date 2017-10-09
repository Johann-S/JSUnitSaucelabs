'use strict'

var https = require('https')

var Util = {
  extend: function (obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function (props) {
      var prop
      for (prop in props) {
        if (Object.prototype.hasOwnProperty.call(props, prop)) {
          obj[prop] = props[prop]
        }
      }
    })
    return obj
  },

  replace: function (str, values) {
    var name = null
    var value = null

    for (name in values) {
      if (Object.prototype.hasOwnProperty.call(values, name)) {
        value = values[name]
        str = str.replace(new RegExp(':' + name, 'g'), value)
      }
    }
    return str
  },

  isArray: function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  },

  request: function (config, callback, verbose, verboseMode) {
    var body = JSON.stringify(config.data)
    var requestConfig = {
      method: config.method,
      host: config.host,
      path: config.path,
      auth: config.auth,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }

    var codeRequestSuccess = 200
    var request = https.request(requestConfig, function (response) {
      var result = ''
      if (callback) {
        response.on('data', function (chunk) {
          result += chunk
        })
        .on('end', function () {
          var res = null
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
    .on('error', function (err) {
      if (callback) {
        callback('Could not send request: ' + err.message)
      } else if (verbose) {
        Util.logWarn('Could not send request: ' + err.message, verboseMode)
      }
    })

    request.write(body)
    request.end()
  },

  formatArray: function (arr) {
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
