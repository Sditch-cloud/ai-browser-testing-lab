'use strict';

const fs = require('fs');
const path = require('path');

async function screenshot({ action, context }) {
  const { page } = context;
  const screenshotPath = action.screenshotPath || `reports/screenshot-${Date.now()}.png`;
  const dir = path.dirname(screenshotPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });
  return { status: 'pass', detail: `Screenshot saved to ${screenshotPath}`, context, screenshotPath };
}

module.exports = { screenshot };
