'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function elementCount({ assertion, context }) {
  const resolved = await resolveDescriptorLocator(assertion, context, { subject: 'element-count assertion' });
  const count = await resolved.handle.count();
  const passed = count === assertion.count;

  return {
    passed,
    actual: String(count),
    expected: String(assertion.count),
    message: passed
      ? `Found ${count} element(s) matching ${describeLocator(resolved.locator)}`
      : `Expected ${assertion.count} element(s) matching ${describeLocator(resolved.locator)} but found ${count}`,
  };
}

module.exports = { elementCount };
