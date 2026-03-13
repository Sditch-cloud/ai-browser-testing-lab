'use strict';

/**
 * Resolves relative navigation URLs against metadata.baseUrl while leaving
 * invalid or already-absolute URLs untouched.
 *
 * @param {object} step
 * @param {object} metadata
 * @returns {object}
 */
function resolveNavigateStepUrl(step, metadata = {}) {
  if (!step || step.type !== 'navigate' || !step.url || !metadata.baseUrl) {
    return step;
  }

  try {
    const resolvedUrl = new URL(step.url, metadata.baseUrl).toString();
    return { ...step, url: resolvedUrl };
  } catch (error) {
    return { ...step };
  }
}

module.exports = {
  resolveNavigateStepUrl,
};