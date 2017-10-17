'use strict'

const emitter     = require('events').EventEmitter
const SauceTunnel = require('sauce-tunnel')
const Util        = require('./util')
const Logger      = require('./logger')

const DEFAULTS = {
  username:    null,
  password:    null,
  tunneled:    true,
  build:       null,
  verbose:     false,
  verboseMode: null,
  hostname:    'saucelabs.com',
  base:        '/rest/v1/'
}

const EVENTS = {
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
  this.logger        = new Logger(this.options.verbose, this.options.verboseMode)
}

// inherits from EventEmitter
JSUnitSaucelabs.prototype = Object.create(emitter.prototype)

JSUnitSaucelabs.prototype.initTunnel = function () {
  if (this.options.tunneled) {
    // eslint-disable-next-line
    this.identifier = Math.floor((new Date()).getTime() / 1000 - 1230768000).toString()
    this.tunnel     = new SauceTunnel(this.options.username, this.options.password, this.identifier, true, [])

    this.logger.debug('Tunnel identifier : ' + this.identifier)

    this.tunnel.start((tunnelStatus) => {
      if (tunnelStatus) {
        this.tunnelStarted = true
        this.logger.info('Tunnel created to Sauce Labs\n')
        this.emit(EVENTS.TUNNEL_CREATED)
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

  const path = this.options.base + Util.replace(':username/js-tests', Util.extend({}, this.options))
  const requestParams = {
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
    this.logger.warn('Not ready to start, please listen to "' + EVENTS.TUNNEL_CREATED + '" events')
    return
  }

  this.logger.info('Launch unit test(s) on ' + url + ' with ' + framework)
  this.logger.debug('method : ' + requestParams.method + ', host : ' + requestParams.host + ', path : ' + requestParams.path)
  Util.request(requestParams, callback, this.options.verbose, this.options.verboseMode)
}

JSUnitSaucelabs.prototype.getStatus = function (taskIds, callback) {
  if (!Util.isArray(taskIds)) {
    taskIds = [taskIds]
  }

  this.logger.debug('getStatus on : "' + taskIds.join(',') + '"')
  const path = this.options.base + Util.replace(':username/js-tests/status', Util.extend({}, this.options))
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
    this.tunnel.stop(() => {
      this.logger.info('Tunnel closed')
    })
  }
}

module.exports = JSUnitSaucelabs
