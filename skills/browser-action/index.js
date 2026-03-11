'use strict';

/**
 * Skill: browser-action
 *
 * Executes a single browser step using Playwright. The caller is responsible
 * for supplying a live Playwright `page` object via `context.page`.
 *
 * Supported action types:
 *   navigate   – go to a URL
 *   click      – click an element
 *   fill       – type a value into an input
 *   select     – choose an option in a <select>
 *   hover      – hover over an element
 *   screenshot – save a screenshot to disk
 *   wait       – wait for a selector or a fixed delay
 *
 * Usage (invoked by Copilot Agent):
 *   const result = await browserAction({ action: step, context: { page } });
 */

const fs = require('fs');
const path = require('path');

/**
 * @param {object}  params
 * @param {object}  params.action   - Step descriptor (see schema.json)
 * @param {object}  params.context  - Must contain { page } – a Playwright Page
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
        if (!action.selector) throw new Error('browser-action/click: "selector" is required.');
        await page.click(action.selector, { timeout });
        return { status: 'pass', detail: `Clicked "${action.selector}"`, context };
      }

      case 'fill': {
        if (!action.selector) throw new Error('browser-action/fill: "selector" is required.');
        if (action.value === undefined) throw new Error('browser-action/fill: "value" is required.');
        await page.fill(action.selector, String(action.value), { timeout });
        return { status: 'pass', detail: `Filled "${action.selector}" with value`, context };
      }

      case 'select': {
        if (!action.selector) throw new Error('browser-action/select: "selector" is required.');
        if (action.value === undefined) throw new Error('browser-action/select: "value" is required.');
        await page.selectOption(action.selector, String(action.value), { timeout });
        return { status: 'pass', detail: `Selected "${action.value}" in "${action.selector}"`, context };
      }

      case 'hover': {
        if (!action.selector) throw new Error('browser-action/hover: "selector" is required.');
        await page.hover(action.selector, { timeout });
        return { status: 'pass', detail: `Hovered over "${action.selector}"`, context };
      }

      case 'screenshot': {
        const screenshotPath = action.screenshotPath || `reports/screenshot-${Date.now()}.png`;
        const dir = path.dirname(screenshotPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: true });
        return { status: 'pass', detail: `Screenshot saved to ${screenshotPath}`, context };
      }

      case 'wait': {
        if (action.selector) {
          await page.waitForSelector(action.selector, { timeout });
          return { status: 'pass', detail: `Waited for selector "${action.selector}"`, context };
        }
        if (action.value) {
          await page.waitForTimeout(Number(action.value));
          return { status: 'pass', detail: `Waited ${action.value}ms`, context };
        }
        throw new Error('browser-action/wait: either "selector" or "value" (ms) is required.');
      }

      default:
        throw new Error(`browser-action: Unknown action type "${action.type}".`);
    }
  } catch (err) {
    return { status: 'fail', detail: err.message, context };
  }
}

module.exports = { browserAction };
