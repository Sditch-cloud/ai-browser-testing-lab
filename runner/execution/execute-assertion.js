'use strict';

const tools = require('../tools');

/**
 * Executes one assertion against the current Playwright page and normalizes
 * low-level assertion failures into a stable runner result shape.
 *
 * @param {object} params
 * @param {object} params.assertion
 * @param {object} params.context
 * @returns {Promise<{passed: boolean, actual: string, expected: string, message: string}>}
 */
async function executeAssertion({ assertion, context }) {
  if (!assertion || !assertion.type) {
    throw new Error('executeAssertion: "assertion.type" is required.');
  }
  if (!context || !context.page) {
    throw new Error('executeAssertion: "context.page" must be a live Playwright Page object.');
  }

  const { page } = context;

  try {
    const assertionHandler = tools.assertion[assertion.type];
    if (!assertionHandler) {
      throw new Error(`executeAssertion: Unknown assertion type "${assertion.type}".`);
    }

    return await assertionHandler({ assertion, context: { page } });
  } catch (error) {
    return {
      passed: false,
      actual: '',
      expected: String(assertion.expected || ''),
      message: `assert error: ${error.message}`,
    };
  }
}

module.exports = { executeAssertion };
