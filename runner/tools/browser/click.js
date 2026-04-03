'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function click({ action, context }) {
  const timeout = action.timeout || 30000;
  const resolved = await resolveDescriptorLocator(action, context, { subject: 'click action' });
  await resolved.handle.click({ timeout });

  return { status: 'pass', detail: `Clicked ${describeLocator(resolved.locator)}`, context };
}

module.exports = { click };
