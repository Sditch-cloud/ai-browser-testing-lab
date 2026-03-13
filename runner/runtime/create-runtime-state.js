'use strict';

/**
 * Creates the mutable state object that is carried through a single test run.
 * This keeps orchestration code focused on control flow instead of state shape.
 *
 * @param {object} params
 * @param {object} params.metadata - Resolved test metadata for the current run.
 * @param {object} params.options - CLI or programmatic runner options.
 * @returns {object} Runtime state container for the active test run.
 */
function createRuntimeState({ metadata, options }) {
  return {
    metadata,
    options,
    context: {},
    logStore: [],
    stepResults: [],
    assertionResults: [],
    timing: {},
    generatedAt: new Date(),
    aborted: false,
    failureReason: null,
  };
}

module.exports = {
  createRuntimeState,
};