'use strict'

var emitter     = require('events').EventEmitter
var SauceTunnel = require('sauce-tunnel')
var Util        = require('./util')

var DEFAULTS = {
  username:    null,
  password:    null,
  tunneled:    true,
  build:       null,
  verbose:     false,
  verboseMode: null,
  hostname:    'saucelabs.com',
  base:        '/rest/v1/'
}

var EVENTS = {
  TUNNEL_CREATED: 'tunnelCreated'
}

/**
 * ------------------------------------------------------------------------
 * JSUnitSaucelabs API
 * ------------------------------------------------------------------------
 */

function JSUnitSaucelabs(options) {
  this.options       = Util.extend({}, DEFAULTS, options)
  this.options.auth  = this.options.username + ':' + this.options.password
  this.identifier    = null
  this.tunnel        = false
  this.tunnelStarted = false
}

// inherits from EventEmitter
JSUnitSaucelabs.prototype = Object.create(emitter.prototype)

JSUnitSaucelabs.prototype.initTunnel = function () {
  if (this.options.tunneled) {
    // eslint-disable-next-line
    this.identifier = Math.floor((new Date()).getTime() / 1000 - 1230768000).toString()
    this.tunnel     = new SauceTunnel(this.options.username, this.options.password, this.identifier, true, [])
    var that        = this
    if (this.options.verbose) {
      Util.logDebug('Tunnel identifier : ' + this.identifier, this.options.verboseMode)
    }

    this.tunnel.start(function (tunnelStatus) {
      if (tunnelStatus) {
        that.tunnelStarted = true
        if (that.options.verbose) {
          Util.logInfo('Tunnel created to Sauce Labs\n', that.options.verboseMode)
        }
        that.emit(EVENTS.TUNNEL_CREATED)
      } else {
        throw new Error('Could not create tunnel to Sauce Labs')
      }
    })
  }
}

// related to : https://wiki.saucelabs.com/display/DOCS/JavaScript+Unit+Testing+Methods#JavaScriptUnitTestingMethods-StartJSUnitTests
JSUnitSaucelabs.prototype.start = function (platforms, url, framework, callback) {
  if (!Util.isArray(platforms)) {
    return
  }
  platforms = Util.formatArray(platforms)

  var path = this.options.base + Util.replace(':username/js-tests', Util.extend({}, this.options))
  var requestParams = {
    method: 'POST',
    host: this.options.hostname,
    path: path,
    auth: this.options.auth,
    data: {
      platforms: platforms,
      url: url,
      framework: framework
    }
  }
  if (this.options.build) {
    requestParams.data.build = this.options.build
  }

  if (this.tunnel && this.tunnelStarted) {
    requestParams.data['tunnel-identifier'] = this.identifier
  } else if (this.tunnel && !this.tunnelStarted) {
    // not ready
    if (this.options.verbose) {
      Util.logWarn('Not ready to start, please listen to "' + EVENTS.TUNNEL_CREATED + '" events', this.options.verboseMode)
    }
    return
  }

  if (this.options.verbose) {
    Util.logInfo('Launch unit test(s) on ' + url + ' with ' + framework, this.options.verboseMode)
    Util.logDebug('method : ' + requestParams.method + ', host : ' + requestParams.host + ', path : ' + requestParams.path, this.options.verboseMode)
  }
  Util.request(requestParams, callback, this.options.verbose, this.options.verboseMode)
}

JSUnitSaucelabs.prototype.getStatus = function (taskIds, callback) {
  if (!Util.isArray(taskIds)) {
    taskIds = [taskIds]
  }

  if (this.options.verbose) {
    Util.logDebug('getStatus on : "' + taskIds.join(',') + '"', this.options.verboseMode)
  }
  var path = this.options.base + Util.replace(':username/js-tests/status', Util.extend({}, this.options))
  Util.request({
    method: 'POST',
    host: this.options.hostname,
    path: path,
    auth: this.options.auth,
    data: {
      'js tests': taskIds
    }
  }, callback, this.options.verbose, this.options.verboseMode)
}

JSUnitSaucelabs.prototype.stop = function () {
  if (this.tunnel && this.tunnelStarted) {
    var that = this
    this.tunnel.stop(function () {
      if (that.options.verbose) {
        Util.logInfo('Tunnel closed', that.options.verboseMode)
      }
    })
  }
}

module.exports = JSUnitSaucelabs
