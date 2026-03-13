'use strict';

const { applyResolvedLocator, needsLocatorResolution } = require('../helpers/locator-utils');

function buildResolutionLogData({ descriptorKind, descriptorIndex, resolvedLocator }) {
  const indexKey = descriptorKind === 'assertion' ? 'assertionIndex' : 'stepIndex';

  return {
    [indexKey]: descriptorIndex,
    strategy: resolvedLocator.strategy,
    locator: resolvedLocator.locator,
  };
}

/**
 * Resolves and applies a locator for a step or assertion when the descriptor is
 * intent-based instead of explicitly targeted.
 *
 * @param {object} params
 * @param {object} params.descriptor
 * @param {'step'|'assertion'} params.descriptorKind
 * @param {number} params.descriptorIndex
 * @param {object} params.context
 * @param {object} params.skills
 * @param {Array<object>} params.logStore
 * @returns {Promise<object>}
 */
async function prepareDescriptorWithLocator({
  descriptor,
  descriptorKind,
  descriptorIndex,
  context,
  skills,
  logStore,
}) {
  if (!needsLocatorResolution(descriptor)) {
    return descriptor;
  }

  const resolvedLocator = await skills.resolveLocator({ descriptor, context });
  const preparedDescriptor = applyResolvedLocator(descriptor, resolvedLocator);

  await skills.recordLog({
    event: 'resolve-locator',
    status: 'pass',
    detail: resolvedLocator.detail || `Resolved locator for ${descriptorKind} ${descriptorIndex + 1}`,
    data: buildResolutionLogData({ descriptorKind, descriptorIndex, resolvedLocator }),
    logStore,
  });

  return preparedDescriptor;
}

module.exports = {
  prepareDescriptorWithLocator,
};