'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function select({ action, context }) {
  if (action.value === undefined) {
    throw new Error('browser-action/select: "value" is required.');
  }

  const timeout = action.timeout || 30000;
  const resolved = await resolveDescriptorLocator(action, context, { subject: 'select action' });
  await resolved.handle.selectOption(String(action.value), { timeout });

  return {
    status: 'pass',
    detail: `Selected "${action.value}" in ${describeLocator(resolved.locator)}`,
    context,
  };
}

module.exports = { select };
