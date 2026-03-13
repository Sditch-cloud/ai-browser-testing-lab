'use strict';

const internalTools = require('../_lib');

/**
 * Internal tools boundary for runner modules.
 * Runner layers above low-level implementations should import from this module
 * instead of accessing `_lib` directly.
 */
module.exports = {
  ...internalTools,
};