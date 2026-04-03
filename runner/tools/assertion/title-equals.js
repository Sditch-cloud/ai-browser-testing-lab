'use strict';

async function titleEquals({ assertion, context }) {
  const { page } = context;
  const title = await page.title();
  const passed = title === assertion.expected;

  return {
    passed,
    actual: title,
    expected: assertion.expected,
    message: passed
      ? `Title equals "${assertion.expected}"`
      : `Expected title "${assertion.expected}" but got "${title}"`,
  };
}

module.exports = { titleEquals };
