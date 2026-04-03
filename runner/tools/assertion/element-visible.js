'use strict';

const { describeLocator, resolveDescriptorLocator } = require('../shared/locator-utils');

async function elementVisible({ assertion, context }) {
  const resolved = await resolveDescriptorLocator(assertion, context, { subject: 'element-visible assertion' });
  const visible = await resolved.handle.isVisible();

  return {
    passed: visible,
    actual: String(visible),
    expected: 'true',
    message: visible
      ? `Element ${describeLocator(resolved.locator)} is visible`
      : `Element ${describeLocator(resolved.locator)} is not visible`,
  };
}

module.exports = { elementVisible };
