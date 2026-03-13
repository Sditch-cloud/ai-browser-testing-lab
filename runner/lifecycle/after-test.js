'use strict';

/**
 * Closes browser resources at the end of a run and returns timing metadata
 * used by reporting.
 *
 * @param {object} [params]
 * @param {object} [params.context]
 * @param {string} [params.startedAt]
 * @returns {Promise<{endedAt: string, durationMs: number}>}
 */
async function afterTest({ context = {}, startedAt } = {}) {
  const { page, browserContext, browser } = context;

  try {
    if (page && !page.isClosed()) {
      await page.close();
    }
  } catch (error) {
    console.warn('[after-test] Warning while closing page:', error.message);
  }

  try {
    if (browserContext) {
      await browserContext.close();
    }
  } catch (error) {
    console.warn('[after-test] Warning while closing browser context:', error.message);
  }

  try {
    if (browser) {
      await browser.close();
    }
  } catch (error) {
    console.warn('[after-test] Warning while closing browser:', error.message);
  }

  const endedAt = new Date().toISOString();
  const durationMs = startedAt
    ? new Date(endedAt).getTime() - new Date(startedAt).getTime()
    : 0;

  console.log(`[after-test] Browser closed. Duration: ${durationMs}ms`);

  return { endedAt, durationMs };
}

module.exports = {
  afterTest,
};