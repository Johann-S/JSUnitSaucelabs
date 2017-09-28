'use strict'

var https = require('https')
var SauceTunnel = require('sauce-tunnel')

var DEFAULTS = {
  username:  null,
  password:  null,
  tunneled:  true,
  build:     null,
  hostname:  'saucelabs.com',
  base:      '/rest/v1/'
}

function extend(obj) {
  Array.prototype.slice.call(arguments, 1).forEach(function (props) {
    var prop
    for (prop in props) {
      if (Object.prototype.hasOwnProperty.call(props, prop)) {
        obj[prop] = props[prop]
      }
    }
  })
  return obj
}

function replace (str, values) {
  var name = null
  var value = null

  for (name in values) {
    if (Object.prototype.hasOwnProperty.call(values, name)) {
      value = values[name]
      str = str.replace(new RegExp(':' + name, 'g'), value)
    }
  }
  return str
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

function request(config, callback) {
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
}

/**
 * ------------------------------------------------------------------------
 * JSUnitSaucelabs API
 * ------------------------------------------------------------------------
 */

function JSUnitSaucelabs(options) {
  this.options = extend({}, DEFAULTS, options)
  this.options.auth = this.options.username + ':' + this.options.password
  this.identifier = Math.floor((new Date()).getTime() / 1000 - 1230768000).toString()
  this.tunnel = false
  if (this.options.tunneled) {
    this.tunnel = new SauceTunnel(this.options.username, this.options.password, this.identifier, true, [])
  }
}

// related to : https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-StartJSUnitTests
JSUnitSaucelabs.prototype.start = function (platforms, url, framework, callback) {
  if (!isArray(platforms)) {
    platforms = [platforms]
  }

  var path = this.options.base + replace(':username/js-tests', extend({}, this.options))
  if (this.tunnel) {
    var that = this
    this.tunnel.start(function (tunnelStatus) {
      if (tunnelStatus) {
        console.log('Tunnel created to SauceLabs')

        var requestParams = {
          method: 'POST',
          host: that.options.hostname,
          path: path,
          auth: that.options.auth,
          data: {
            platforms: platforms,
            url: url,
            framework: framework,
            'tunnel-identifier': that.identifier
          }
        }
        if (that.options.build) {
          requestParams.data.build = that.options.build
        }
        request(requestParams, callback)
      } else {
        throw new Error('Could not create tunnel to SauceLabs')
      }
    })

  } else {
    request({
      method: 'POST',
      host: this.options.hostname,
      path: path,
      auth: this.options.auth,
      data: {
        platforms: platforms,
        url: url,
        framework: framework
      }
    }, callback)
  }
}

JSUnitSaucelabs.prototype.getStatus = function (taskIds, callback) {
  if (!isArray(taskIds)) {
    taskIds = [taskIds]
  }

  var path = this.options.base + replace(':username/js-tests/status', extend({}, this.options))
  request({
    method: 'POST',
    host: this.options.hostname,
    path: path,
    auth: this.options.auth,
    data: {
      'js tests': taskIds
    }
  }, callback)
}

JSUnitSaucelabs.prototype.stop = function () {
  if (this.tunnel) {
    this.tunnel.stop(function () {
      console.log('Tunnel closed')
    })
  }
}

module.exports = JSUnitSaucelabs