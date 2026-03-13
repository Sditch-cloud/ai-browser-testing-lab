'use strict';

const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createBaseFileName(testName, generatedAt = new Date()) {
  return `${testName}-${generatedAt.toISOString().replace(/[:.]/g, '-')}`;
}

function createReportPayload({ testName, metadata, logs, summary, generatedAt }) {
  return {
    testName,
    metadata,
    summary,
    generatedAt: generatedAt.toISOString(),
    logs,
  };
}

function resolveReportFile(outputDir, baseFileName, extension) {
  return path.join(outputDir, `${baseFileName}.${extension}`);
}

module.exports = {
  createBaseFileName,
  createReportPayload,
  ensureDir,
  resolveReportFile,
};