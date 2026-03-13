'use strict';

const tools = require('../tools');
const { resolveReportFile } = require('./utils');

async function writeHtmlReport({ testName, metadata, logs, summary, outputDir, baseFileName }) {
  const filePath = resolveReportFile(outputDir, baseFileName, 'html');
  await tools.io.writeHtml({ filePath, testName, metadata, summary, logs });
  return filePath;
}

module.exports = { writeHtmlReport };