'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function resolve({ descriptor, context = {} }) {
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
    handle: resolved.handle,
  };
}

module.exports = { resolve };
