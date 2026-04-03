'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function elementText({ assertion, context }) {
  const resolved = await resolveDescriptorLocator(assertion, context, { subject: 'element-text assertion' });
  const text = (await resolved.handle.innerText()).trim();
  const passed = text === assertion.expected;

  return {
    passed,
    actual: text,
    expected: assertion.expected,
    message: passed
      ? `Element ${describeLocator(resolved.locator)} has text "${assertion.expected}"`
      : `Expected text "${assertion.expected}" but got "${text}"`,
  };
}

module.exports = { elementText };
