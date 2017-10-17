'use strict'

const colors    = require('colors/safe')
const moduleTag = colors.gray('JSUnitSaucelabs - ')
const infoTag   = colors.cyan('[Info] ')
const warnTag   = colors.yellow('[Warn] ')
const debugTag  = colors.green('[Debug] ')
const errorTag  = colors.red('[Error] ')

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
