'use strict';

/**
 * Skill: assert
 *
 * Evaluates a single assertion against the current browser state.
 *
 * Supported assertion types:
 *   url-contains      – current URL contains expected substring
 *   title-equals      – page title equals expected string
 *   element-visible   – element matching selector is visible
 *   element-text      – element text content equals expected string
 *   element-count     – number of elements matching selector equals count
 *   attribute-equals  – attribute value of element equals expected string
 *
 * Usage (invoked by Copilot Agent):
 *   const result = await assert({ assertion, context: { page } });
 */

/**
 * @param {object} params
 * @param {object} params.assertion - Assertion descriptor (see schema.json)
 * @param {object} params.context   - Must contain { page } – a Playwright Page
 * @returns {{ passed: boolean, actual: string, expected: string, message: string }}
 */
async function assert({ assertion, context }) {
  if (!assertion || !assertion.type) {
    throw new Error('assert: "assertion.type" is required.');
  }
  if (!context || !context.page) {
    throw new Error('assert: "context.page" must be a live Playwright Page object.');
  }

  const { page } = context;

  try {
    switch (assertion.type) {
      case 'url-contains': {
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

      case 'title-equals': {
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

      case 'element-visible': {
        if (!assertion.selector) throw new Error('assert/element-visible: "selector" is required.');
        const locator = page.locator(assertion.selector);
        const visible = await locator.isVisible();
        return {
          passed: visible,
          actual: String(visible),
          expected: 'true',
          message: visible
            ? `Element "${assertion.selector}" is visible`
            : `Element "${assertion.selector}" is not visible`,
        };
      }

      case 'element-text': {
        if (!assertion.selector) throw new Error('assert/element-text: "selector" is required.');
        const locator = page.locator(assertion.selector);
        const text = (await locator.innerText()).trim();
        const passed = text === assertion.expected;
        return {
          passed,
          actual: text,
          expected: assertion.expected,
          message: passed
            ? `Element "${assertion.selector}" has text "${assertion.expected}"`
            : `Expected text "${assertion.expected}" but got "${text}"`,
        };
      }

      case 'element-count': {
        if (!assertion.selector) throw new Error('assert/element-count: "selector" is required.');
        const count = await page.locator(assertion.selector).count();
        const passed = count === assertion.count;
        return {
          passed,
          actual: String(count),
          expected: String(assertion.count),
          message: passed
            ? `Found ${count} element(s) matching "${assertion.selector}"`
            : `Expected ${assertion.count} element(s) matching "${assertion.selector}" but found ${count}`,
        };
      }

      case 'attribute-equals': {
        if (!assertion.selector) throw new Error('assert/attribute-equals: "selector" is required.');
        if (!assertion.attribute) throw new Error('assert/attribute-equals: "attribute" is required.');
        const value = await page.locator(assertion.selector).getAttribute(assertion.attribute);
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

      default:
        throw new Error(`assert: Unknown assertion type "${assertion.type}".`);
    }
  } catch (err) {
    return {
      passed: false,
      actual: '',
      expected: String(assertion.expected || ''),
      message: `assert error: ${err.message}`,
    };
  }
}

module.exports = { assert };
