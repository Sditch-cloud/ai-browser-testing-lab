'use strict';

/**
 * Skill: browser-action
 *
 * Executes a single browser step using Playwright. The caller is responsible
 * for supplying a live Playwright `page` object via `context.page`.
 *
 * Supported action types:
 *   navigate   - go to a URL
 *   click      - click an element
 *   fill       - type a value into an input
 *   select     - choose an option in a <select>
 *   hover      - hover over an element
 *   screenshot - save a screenshot to disk
 *   wait       - wait for a selector or a fixed delay
 *
 * Usage (invoked by Copilot Agent):
 *   const result = await browserAction({ action: step, context: { page } });
 */

const fs = require('fs');
const path = require('path');
const { describeLocator, resolveDescriptorLocator } = require('../_shared/locator.js');

/**
 * @param {object}  params
 * @param {object}  params.action   - Step descriptor (see schema.json)
 * @param {object}  params.context  - Must contain { page } - a Playwright Page
 * @returns {{ status: string, detail: string, context: object }}
 */
async function browserAction({ action, context }) {
  if (!action || !action.type) {
    throw new Error('browser-action: "action.type" is required.');
  }
  if (!context || !context.page) {
    throw new Error('browser-action: "context.page" must be a live Playwright Page object.');
  }

  const { page } = context;
  const timeout = action.timeout || 30000;

  try {
    switch (action.type) {
      case 'navigate': {
        if (!action.url) throw new Error('browser-action/navigate: "url" is required.');
        await page.goto(action.url, { timeout, waitUntil: 'domcontentloaded' });
        return { status: 'pass', detail: `Navigated to ${action.url}`, context };
      }

      case 'click': {
        const resolved = await resolveDescriptorLocator(action, context, { subject: 'click action' });
        await resolved.handle.click({ timeout });
        return { status: 'pass', detail: `Clicked ${describeLocator(resolved.locator)}`, context };
      }

      case 'fill': {
        if (action.value === undefined) throw new Error('browser-action/fill: "value" is required.');
        const resolved = await resolveDescriptorLocator(action, context, { subject: 'fill action' });
        await resolved.handle.fill(String(action.value), { timeout });
        return { status: 'pass', detail: `Filled ${describeLocator(resolved.locator)} with value`, context };
      }

      case 'select': {
        if (action.value === undefined) throw new Error('browser-action/select: "value" is required.');
        const resolved = await resolveDescriptorLocator(action, context, { subject: 'select action' });
        await resolved.handle.selectOption(String(action.value), { timeout });
        return { status: 'pass', detail: `Selected "${action.value}" in ${describeLocator(resolved.locator)}`, context };
      }

      case 'hover': {
        const resolved = await resolveDescriptorLocator(action, context, { subject: 'hover action' });
        await resolved.handle.hover({ timeout });
        return { status: 'pass', detail: `Hovered over ${describeLocator(resolved.locator)}`, context };
      }

      case 'screenshot': {
        const screenshotPath = action.screenshotPath || `reports/screenshot-${Date.now()}.png`;
        const dir = path.dirname(screenshotPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: true });
        return { status: 'pass', detail: `Screenshot saved to ${screenshotPath}`, context };
      }

      case 'wait': {
        if (action.selector || action.testId || action.label || action.role || action.text || action.placeholder || action.locator || action.target || action.description) {
          const resolved = await resolveDescriptorLocator(action, context, { subject: 'wait action' });
          await resolved.handle.waitFor({ state: 'visible', timeout });
          return { status: 'pass', detail: `Waited for ${describeLocator(resolved.locator)}`, context };
        }
        if (action.value) {
          await page.waitForTimeout(Number(action.value));
          return { status: 'pass', detail: `Waited ${action.value}ms`, context };
        }
        throw new Error('browser-action/wait: provide locator information or "value" (ms).');
      }

      default:
        throw new Error(`browser-action: Unknown action type "${action.type}".`);
    }
  } catch (err) {
    return { status: 'fail', detail: err.message, context };
  }
}

module.exports = { browserAction };
