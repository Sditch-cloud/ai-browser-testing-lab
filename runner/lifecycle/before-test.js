'use strict';

const { chromium } = require('playwright');

/**
 * Starts browser resources before a test run begins and returns the context
 * object shared by step execution and assertions.
 *
 * @param {object} [params]
 * @param {object} [params.metadata]
 * @param {boolean} [params.headless]
 * @param {number} [params.slowMo]
 * @returns {Promise<{browser: object, browserContext: object, page: object, startedAt: string}>}
 */
async function beforeTest({ metadata = {}, headless = true, slowMo = 0 } = {}) {
  const browser = await chromium.launch({
    headless,
    slowMo,
  });

  const browserContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (compatible; AIBrowserTestingLab/1.0; +https://github.com/Sditch-cloud/ai-browser-testing-lab)',
    ignoreHTTPSErrors: true,
    recordVideo: undefined,
  });

  const page = await browserContext.newPage();

  page.setDefaultTimeout(metadata.timeout || 30000);
  page.setDefaultNavigationTimeout(metadata.timeout || 30000);

  console.log(`[before-test] Browser launched for test "${metadata.name || 'unknown'}"`);

  return {
    browser,
    browserContext,
    page,
    startedAt: new Date().toISOString(),
  };
}

module.exports = {
  beforeTest,
};