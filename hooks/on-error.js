'use strict';

/**
 * Hook: on-error
 *
 * Fired by the Copilot Agent when an unhandled exception occurs during a step.
 * Responsibilities:
 *   - Capture a screenshot of the current browser state for diagnostics
 *   - Log the error to the console
 *   - Return structured error information so the agent can decide whether to
 *     abort or continue (based on metadata.continueOnFail)
 *
 * Usage (invoked by Copilot Agent):
 *   const errorInfo = await onError({ error, context, stepIndex, metadata });
 */

const fs = require('fs');
const path = require('path');

/**
 * @param {object}  params
 * @param {Error}   params.error      - The error that was thrown
 * @param {object}  params.context    - Current browser context (from before-test)
 * @param {number}  [params.stepIndex]- Index of the step that failed
 * @param {object}  [params.metadata] - Test case metadata
 * @returns {{ screenshotPath: string|null, errorMessage: string, shouldAbort: boolean }}
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
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

      screenshotPath = path.join(
        reportsDir,
        `error-step${stepIndex}-${Date.now()}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`[on-error] Error screenshot saved to ${screenshotPath}`);
    }
  } catch (screenshotErr) {
    console.warn('[on-error] Could not capture error screenshot:', screenshotErr.message);
  }

  const shouldAbort = !metadata.continueOnFail;

  return {
    screenshotPath,
    errorMessage,
    shouldAbort,
  };
}

module.exports = { onError };
