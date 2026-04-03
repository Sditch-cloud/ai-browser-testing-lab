'use strict';

async function urlContains({ assertion, context }) {
  const { page } = context;
  const url = page.url();
  const passed = url.includes(assertion.expected);

  return {
    passed,
    actual: url,
    expected: assertion.expected,
    message: passed
      ? `URL contains "${assertion.expected}"`
      : `Expected URL to contain "${assertion.expected}" but got "${url}"`,
  };
}

module.exports = { urlContains };
