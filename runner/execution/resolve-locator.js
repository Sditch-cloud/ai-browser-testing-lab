'use strict';

const tools = require('../tools');

/**
 * Resolves a natural-language target or weak locator hint into the structured
 * locator descriptor used by execution helpers.
 *
 * @param {object} params
 * @param {object} params.descriptor
 * @param {object} [params.context]
 * @returns {Promise<{locator: object, strategy: string, detail: string}>}
 */
async function resolveLocator({ descriptor, context = {} }) {
  const resolvedLocator = await tools.locator.resolve({ descriptor, context });

  return {
    locator: resolvedLocator.locator,
    strategy: resolvedLocator.strategy,
    detail: resolvedLocator.detail,
  };
}

module.exports = {
  resolveLocator,
};