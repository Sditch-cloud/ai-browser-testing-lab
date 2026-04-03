'use strict';

const assertion = require('./assertion');
const browser = require('./browser');
const io = require('./io');
const locator = require('./locator');
const log = require('./log');

/**
 * Internal tools boundary for runner modules.
 * Runner layers above low-level implementations should import from this module
 * instead of accessing internal subdirectories directly.
 */
module.exports = {
  assertion,
  browser,
  io,
  locator,
  log,
};