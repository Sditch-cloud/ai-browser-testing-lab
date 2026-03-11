'use strict';

/**
 * Skill: parse-testcase
 *
 * Reads a YAML test case definition from tests/cases/<testName>.yaml and
 * returns a structured object with three sections:
 *   - metadata  : test name, description, author, tags, continueOnFail flag
 *   - steps     : ordered list of browser actions
 *   - assertions: list of assertion descriptors (may also appear inline in steps)
 *
 * Usage (invoked by Copilot Agent):
 *   const result = await parseTestCase({ testName: 'login' });
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * @param {object} params
 * @param {string} params.testName   - Test name without extension
 * @param {string} [params.casesDir] - Override directory (default: tests/cases)
 * @returns {object} { metadata, steps, assertions }
 */
async function parseTestCase({ testName, casesDir = 'tests/cases' }) {
  if (!testName || typeof testName !== 'string') {
    throw new Error('parse-testcase: "testName" parameter is required and must be a string.');
  }

  const rootDir = path.resolve(__dirname, '..', '..');
  const filePath = path.join(rootDir, casesDir, `${testName}.yaml`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`parse-testcase: Test case file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = yaml.load(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`parse-testcase: Failed to parse YAML from ${filePath}`);
  }

  const metadata = {
    name: parsed.name || testName,
    description: parsed.description || '',
    author: parsed.author || 'unknown',
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    baseUrl: parsed.baseUrl || '',
    continueOnFail: parsed.continueOnFail === true,
    timeout: typeof parsed.timeout === 'number' ? parsed.timeout : 30000,
  };

  const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
  const assertions = Array.isArray(parsed.assertions) ? parsed.assertions : [];

  return { metadata, steps, assertions };
}

module.exports = { parseTestCase };
