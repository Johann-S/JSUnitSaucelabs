'use strict'

var https       = require('https')
var emitter     = require('events').EventEmitter
var SauceTunnel = require('sauce-tunnel')

var DEFAULTS = {
  username:  null,
  password:  null,
  tunneled:  true,
  build:     null,
  hostname:  'saucelabs.com',
  base:      '/rest/v1/'
}

var EVENTS = {
  TUNNEL_CREATED: 'tunnelCreated'
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
  this.options       = extend({}, DEFAULTS, options)
  this.options.auth  = this.options.username + ':' + this.options.password
  this.identifier    = null
  this.tunnel        = false
  this.tunnelStarted = false
}

// inherits from EventEmitter
JSUnitSaucelabs.prototype = Object.create(emitter.prototype)

JSUnitSaucelabs.prototype.initTunnel = function () {
  if (this.options.tunneled) {
    this.identifier = Math.floor((new Date()).getTime() / 1000 - 1230768000).toString()
    this.tunnel     = new SauceTunnel(this.options.username, this.options.password, this.identifier, true, [])
    var that        = this

    this.tunnel.start(function (tunnelStatus) {
      if (tunnelStatus) {
        that.tunnelStarted = true
        that.emit(EVENTS.TUNNEL_CREATED)
        console.log('Tunnel created to Sauce Labs\n')
      } else {
        throw new Error('Could not create tunnel to Sauce Labs')
      }
    })
  }
}

// related to : https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-StartJSUnitTests
JSUnitSaucelabs.prototype.start = function (platforms, url, framework, callback) {
  if (!isArray(platforms)) {
    platforms = [platforms]
  }

  var path = this.options.base + replace(':username/js-tests', extend({}, this.options))
  var requestParams = {
    method: 'POST',
    host: this.options.hostname,
    path: path,
    auth: this.options.auth,
    data: {
      platforms: platforms,
      url: url,
      framework: framework,
    }
  }
  if (this.options.build) {
    requestParams.data.build = this.options.build
  }

  if (this.tunnel && this.tunnelStarted) {
    requestParams.data['tunnel-identifier'] = this.identifier
  } else if (this.tunnel && !this.tunnelStarted) {
    // not ready
    console.warn('Not ready to start, please listen to ' + EVENTS.TUNNEL_CREATED + ' events')
    return
  }
  request(requestParams, callback)
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
  if (this.tunnel && this.tunnelStarted) {
    this.tunnel.stop(function () {
      console.log('Tunnel closed')
    })
  }
}

module.exports = JSUnitSaucelabs
