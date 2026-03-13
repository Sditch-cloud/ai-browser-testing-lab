'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function fill({ action, context }) {
  if (action.value === undefined) {
    throw new Error('browser-action/fill: "value" is required.');
  }

  const timeout = action.timeout || 30000;
  const resolved = await resolveDescriptorLocator(action, context, { subject: 'fill action' });
  await resolved.handle.fill(String(action.value), { timeout });

  return { status: 'pass', detail: `Filled ${describeLocator(resolved.locator)} with value`, context };
}

module.exports = { fill };
