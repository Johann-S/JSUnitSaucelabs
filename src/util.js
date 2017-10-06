var https     = require('https')
var colors    = require('colors/safe')
var moduleTag = colors.gray('JSUnitSaucelabs - ')
var infoTag   = colors.cyan('[Info] ')
var warnTag   = colors.yellow('[Warn] ')
var debugTag  = colors.green('[Debug] ')

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

  request: function (config, callback) {
    var body = JSON.stringify(config.data)
    var requestConfig = {
      method: config.method,
      host: config.host,
      path: config.path,
      auth: config.auth,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

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
  
            if (response.statusCode === 200) {
              callback(null, res)
            } else {
              callback(res)
            }
          })
      }
    })
    .on('error', function (err) {
      callback('Could not send request: ' + err.message)
    })
  
    request.write(body)
    request.end()
  },

  logInfo: function (str, mode) {
    if (mode === null || mode === 'info' || mode === 'debug') {
      console.log(moduleTag + infoTag + str)
    }
  },

  logWarn: function (str, mode) {
    if (mode === null || mode === 'warn' || mode === 'debug') {
      console.warn(moduleTag + warnTag + str)
    }   
  },

  logDebug: function (str, mode) {
    if (mode === 'debug') {
      console.warn(moduleTag + debugTag + str)
    }   
  }
}

module.exports = Util
