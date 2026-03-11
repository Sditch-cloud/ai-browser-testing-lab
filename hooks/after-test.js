'use strict';

/**
 * Hook: after-test
 *
 * Fired by the Copilot Agent after all browser steps complete (pass or fail).
 * Responsibilities:
 *   - Close the Playwright page
 *   - Close the browser context
 *   - Close the browser instance
 *   - Return timing information for the report
 *
 * Usage (invoked by Copilot Agent):
 *   const timing = await afterTest({ context, startedAt });
 */

/**
 * @param {object}  params
 * @param {object}  params.context    - The context returned by before-test
 * @param {string}  [params.startedAt]- ISO-8601 start time for duration calc
 * @returns {{ endedAt: string, durationMs: number }}
 */
async function afterTest({ context = {}, startedAt } = {}) {
  const { page, browserContext, browser } = context;

  try {
    if (page && !page.isClosed()) {
      await page.close();
    }
  } catch (err) {
    console.warn('[after-test] Warning while closing page:', err.message);
  }

  try {
    if (browserContext) {
      await browserContext.close();
    }
  } catch (err) {
    console.warn('[after-test] Warning while closing browser context:', err.message);
  }

  try {
    if (browser) {
      await browser.close();
    }
  } catch (err) {
    console.warn('[after-test] Warning while closing browser:', err.message);
  }

  const endedAt = new Date().toISOString();
  const durationMs = startedAt
    ? new Date(endedAt).getTime() - new Date(startedAt).getTime()
    : 0;

  console.log(`[after-test] Browser closed. Duration: ${durationMs}ms`);

  return { endedAt, durationMs };
}

module.exports = { afterTest };
