'use strict';

/**
 * Hook: before-test
 *
 * Fired by the Copilot Agent before the first browser step of a test run.
 * Responsibilities:
 *   - Launch a Playwright browser instance
 *   - Create a new browser context with sensible defaults
 *   - Open the initial page
 *   - Return the context object that will be threaded through all skill calls
 *
 * Usage (invoked by Copilot Agent):
 *   const context = await beforeTest({ metadata });
 *   // context.page is now available for browser-action and assert skills
 */

const { chromium } = require('playwright');

/**
 * @param {object}  params
 * @param {object}  params.metadata  - Test case metadata (from parse-testcase)
 * @param {boolean} [params.headless]- Override headless mode (default: true)
 * @returns {{ browser, browserContext, page, startedAt }}
 */
async function beforeTest({ metadata = {}, headless = true } = {}) {
  const browser = await chromium.launch({ headless });

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

module.exports = { beforeTest };
