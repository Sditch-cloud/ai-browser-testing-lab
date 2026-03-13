'use strict';

/**
 * Merges parsed test metadata with caller overrides, preserving runner-level
 * overrides as the highest-priority source.
 *
 * @param {object} metadata
 * @param {object} overrides
 * @returns {object}
 */
function mergeRuntimeMetadata(metadata = {}, overrides = {}) {
  return {
    ...metadata,
    baseUrl: overrides.baseUrl || metadata.baseUrl || '',
    timeout: typeof overrides.timeout === 'number' ? overrides.timeout : metadata.timeout,
    continueOnFail:
      typeof overrides.continueOnFail === 'boolean'
        ? overrides.continueOnFail
        : metadata.continueOnFail === true,
  };
}

module.exports = {
  mergeRuntimeMetadata,
};