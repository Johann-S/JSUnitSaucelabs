'use strict'

const colors    = require('colors/safe')
const moduleTag = colors.gray('JSUnitSaucelabs - ')
const infoTag   = colors.cyan('[Info] ')
const warnTag   = colors.yellow('[Warn] ')
const debugTag  = colors.green('[Debug] ')
const errorTag  = colors.red('[Error] ')

class Logger {
  constructor(enabled, mode) {
    this.enabled = enabled
    this.mode    = mode
  }

  info(str) {
    if (this.enabled) {
      if (this.mode === null || this.mode === 'info' || this.mode === 'debug') {
        console.log(moduleTag + infoTag + str)
      }
    }
  }

  warn(str) {
    if (this.enabled) {
      if (this.mode === null || this.mode === 'warn' || this.mode === 'debug') {
        console.warn(moduleTag + warnTag + str)
      }
    }
  }

  debug(str) {
    if (this.enabled) {
      if (this.mode === 'debug') {
        console.warn(moduleTag + debugTag + str)
      }
    }
  }

  error(str) {
    if (this.enabled) {
      if (this.mode === null || this.mode === 'err' || this.mode === 'debug') {
        console.error(moduleTag + errorTag + str)
      }
    }
  }
}

module.exports = Logger
