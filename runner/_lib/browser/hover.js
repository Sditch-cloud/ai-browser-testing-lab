'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function hover({ action, context }) {
  const timeout = action.timeout || 30000;
  const resolved = await resolveDescriptorLocator(action, context, { subject: 'hover action' });
  await resolved.handle.hover({ timeout });

  return { status: 'pass', detail: `Hovered over ${describeLocator(resolved.locator)}`, context };
}

module.exports = { hover };
