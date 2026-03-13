'use strict';

const { resolveDescriptorLocator } = require('../shared/locator-utils');

async function attributeEquals({ assertion, context }) {
  if (!assertion.attribute) {
    throw new Error('assert/attribute-equals: "attribute" is required.');
  }

  const resolved = await resolveDescriptorLocator(assertion, context, { subject: 'attribute-equals assertion' });
  const value = await resolved.handle.getAttribute(assertion.attribute);
  const passed = value === assertion.expected;

  return {
    passed,
    actual: String(value),
    expected: assertion.expected,
    message: passed
      ? `Attribute "${assertion.attribute}" equals "${assertion.expected}"`
      : `Expected attribute "${assertion.attribute}" to be "${assertion.expected}" but got "${value}"`,
  };
}

module.exports = { attributeEquals };
