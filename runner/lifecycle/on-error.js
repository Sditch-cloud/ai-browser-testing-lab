'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Handles unexpected step execution errors by capturing diagnostics and
 * returning abort behavior based on metadata.continueOnFail.
 *
 * @param {object} [params]
 * @param {Error} params.error
 * @param {object} [params.context]
 * @param {number} [params.stepIndex]
 * @param {object} [params.metadata]
 * @returns {Promise<{screenshotPath: string|null, errorMessage: string, shouldAbort: boolean}>}
 */
async function onError({ error, context = {}, stepIndex = -1, metadata = {} } = {}) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[on-error] Step ${stepIndex} failed: ${errorMessage}`);

  let screenshotPath = null;

  try {
    const { page } = context;
    if (page && !page.isClosed()) {
      const rootDir = path.resolve(__dirname, '..');
      const reportsDir = path.join(rootDir, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      screenshotPath = path.join(reportsDir, `error-step${stepIndex}-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`[on-error] Error screenshot saved to ${screenshotPath}`);
    }
  } catch (screenshotError) {
    console.warn('[on-error] Could not capture error screenshot:', screenshotError.message);
  }

  return {
    screenshotPath,
    errorMessage,
    shouldAbort: !metadata.continueOnFail,
  };
}

module.exports = {
  onError,
};