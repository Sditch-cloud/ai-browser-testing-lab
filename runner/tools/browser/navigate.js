'use strict';

async function navigate({ action, context }) {
  if (!action.url) {
    throw new Error('browser-action/navigate: "url" is required.');
  }

  const { page } = context;
  const timeout = action.timeout || 30000;
  await page.goto(action.url, { timeout, waitUntil: 'domcontentloaded' });

  return { status: 'pass', detail: `Navigated to ${action.url}`, context };
}

module.exports = { navigate };
