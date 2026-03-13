'use strict';

const fs = require('fs');
const path = require('path');
const tools = require('../tools');

function normalizeMetadata(parsedTestCase, fallbackName) {
  const metadata = parsedTestCase.metadata && typeof parsedTestCase.metadata === 'object'
    ? parsedTestCase.metadata
    : parsedTestCase;

  return {
    name: metadata.name || fallbackName,
    description: metadata.description || '',
    author: metadata.author || 'unknown',
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    baseUrl: metadata.baseUrl || '',
    continueOnFail: metadata.continueOnFail === true,
    timeout: typeof metadata.timeout === 'number' ? metadata.timeout : 30000,
  };
}

function normalizeParsedTestCase(parsedTestCase, fallbackName) {
  return {
    metadata: normalizeMetadata(parsedTestCase, fallbackName),
    steps: Array.isArray(parsedTestCase.steps) ? parsedTestCase.steps : [],
    assertions: Array.isArray(parsedTestCase.assertions) ? parsedTestCase.assertions : [],
  };
}

function resolveTestCaseFilePath({ testName, filePath, casesDir = 'tests/cases' }) {
  const rootDir = path.resolve(__dirname, '..', '..');

  if (filePath) {
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(rootDir, filePath);
  }

  return path.join(rootDir, casesDir, `${testName}.yaml`);
}

/**
 * Loads and normalizes a YAML test case before execution begins.
 * This is part of runtime setup rather than step execution because it resolves
 * the input source and produces the canonical metadata/steps/assertions shape.
 *
 * @param {object} params
 * @param {string} [params.testName]
 * @param {string} [params.filePath]
 * @param {string} [params.casesDir]
 * @returns {Promise<{metadata: object, steps: Array<object>, assertions: Array<object>}>}
 */
async function parseTestCase({ testName, filePath, casesDir = 'tests/cases' }) {
  if ((!testName || typeof testName !== 'string') && (!filePath || typeof filePath !== 'string')) {
    throw new Error('parse-test-case: "testName" or "filePath" parameter is required and must be a string.');
  }

  const resolvedFilePath = resolveTestCaseFilePath({ testName, filePath, casesDir });
  const inferredName = testName || path.basename(resolvedFilePath, path.extname(resolvedFilePath));

  if (!fs.existsSync(resolvedFilePath)) {
    throw new Error(`parse-test-case: Test case file not found: ${resolvedFilePath}`);
  }

  const { data: parsedTestCase } = await tools.io.readYaml({ filePath: resolvedFilePath });

  if (!parsedTestCase || typeof parsedTestCase !== 'object') {
    throw new Error(`parse-test-case: Failed to parse YAML from ${resolvedFilePath}`);
  }

  return normalizeParsedTestCase(parsedTestCase, inferredName);
}

module.exports = {
  parseTestCase,
  resolveTestCaseFilePath,
};