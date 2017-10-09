'use strict'

var colors    = require('colors/safe')
var moduleTag = colors.gray('JSUnitSaucelabs - ')
var infoTag   = colors.cyan('[Info] ')
var warnTag   = colors.yellow('[Warn] ')
var debugTag  = colors.green('[Debug] ')
var errorTag  = colors.red('[Error] ')

function Logger(enabled, mode) {
  this.enabled = enabled
  this.mode    = mode
}

Logger.prototype.info = function (str) {
  if (this.enabled) {
    if (this.mode === null || this.mode === 'info' || this.mode === 'debug') {
      console.log(moduleTag + infoTag + str)
    }
  }
}

Logger.prototype.warn = function (str) {
  if (this.enabled) {
    if (this.mode === null || this.mode === 'warn' || this.mode === 'debug') {
      console.warn(moduleTag + warnTag + str)
    }
  }
}

Logger.prototype.debug = function (str) {
  if (this.enabled) {
    if (this.mode === 'debug') {
      console.warn(moduleTag + debugTag + str)
    }
  }
}

Logger.prototype.error = function (str) {
  if (this.enabled) {
    if (this.mode === null || this.mode === 'err' || this.mode === 'debug') {
      console.error(moduleTag + errorTag + str)
    }
  }
}

module.exports = Logger
