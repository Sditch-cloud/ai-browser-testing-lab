'use strict';

const tools = require('../tools');
const { createReportPayload, resolveReportFile } = require('./utils');

async function writeJsonReport({ testName, metadata, logs, summary, generatedAt, outputDir, baseFileName }) {
  const filePath = resolveReportFile(outputDir, baseFileName, 'json');
  const payload = createReportPayload({ testName, metadata, logs, summary, generatedAt });
  await tools.io.writeJson({ filePath, data: payload });
  return filePath;
}

module.exports = { writeJsonReport };