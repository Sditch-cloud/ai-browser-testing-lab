'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

function hasLocatorHints(action) {
  return Boolean(
    action.selector ||
      action.testId ||
      action.label ||
      action.role ||
      action.text ||
      action.placeholder ||
      action.locator ||
      action.target ||
      action.description
  );
}

async function wait({ action, context }) {
  const { page } = context;
  const timeout = action.timeout || 30000;

  if (hasLocatorHints(action)) {
    const resolved = await resolveDescriptorLocator(action, context, { subject: 'wait action' });
    await resolved.handle.waitFor({ state: 'visible', timeout });
    return { status: 'pass', detail: `Waited for ${describeLocator(resolved.locator)}`, context };
  }

  if (action.value) {
    await page.waitForTimeout(Number(action.value));
    return { status: 'pass', detail: `Waited ${action.value}ms`, context };
  }

  throw new Error('browser-action/wait: provide locator information or "value" (ms).');
}

module.exports = { wait };
