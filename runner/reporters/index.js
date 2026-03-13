'use strict';

const path = require('path');
const { writeHtmlReport } = require('./html-reporter');
const { writeJsonReport } = require('./json-reporter');
const { createBaseFileName, ensureDir } = require('./utils');

/**
 * Generates the persisted JSON and HTML reports for a completed runner session.
 * This is the only report entrypoint the orchestrator should depend on.
 *
 * @param {object} params
 * @returns {Promise<{jsonPath: string, htmlPath: string, summary: object}>}
 */
async function generateReports({ testName, metadata, logs, summary, outputDir = 'reports', generatedAt = new Date() }) {
  const rootDir = path.resolve(__dirname, '../..');
  const resolvedOutputDir = path.isAbsolute(outputDir)
    ? outputDir
    : path.join(rootDir, outputDir);

  ensureDir(resolvedOutputDir);

  const baseFileName = createBaseFileName(testName, generatedAt);
  const jsonPath = await writeJsonReport({
    testName,
    metadata,
    logs,
    summary,
    generatedAt,
    outputDir: resolvedOutputDir,
    baseFileName,
  });
  const htmlPath = await writeHtmlReport({
    testName,
    metadata,
    logs,
    summary,
    outputDir: resolvedOutputDir,
    baseFileName,
  });

  return {
    jsonPath,
    htmlPath,
    summary,
  };
}

module.exports = {
  generateReports,
  writeHtmlReport,
  writeJsonReport,
};