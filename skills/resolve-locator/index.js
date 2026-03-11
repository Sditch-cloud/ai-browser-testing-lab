'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../_shared/locator.js');

/**
 * Skill: resolve-locator
 *
 * Resolves a natural-language target or weakly-structured locator hints into
 * a Playwright-compatible locator descriptor.
 *
 * Usage:
 *   const result = await resolveLocator({ descriptor: step, context: { page } });
 */
async function resolveLocator({ descriptor, context = {} }) {
  if (!descriptor || typeof descriptor !== 'object') {
    throw new Error('resolve-locator: "descriptor" is required and must be an object.');
  }

  const resolved = await resolveDescriptorLocator(descriptor, context, {
    required: true,
    subject: 'descriptor',
  });

  return {
    locator: resolved.locator,
    strategy: resolved.strategy,
    detail: resolved.detail || `Resolved ${describeLocator(resolved.locator)}`,
  };
}

module.exports = { resolveLocator };
