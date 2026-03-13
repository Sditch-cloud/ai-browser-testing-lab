'use strict';

const path = require('path');

function resolveReportOutputDir(outputDir) {
  return outputDir || 'reports';
}

function resolveTestName(testCaseInput, parsedMetadata = {}) {
  if (parsedMetadata.name) {
    return parsedMetadata.name;
  }

  if (!testCaseInput) {
    return 'unnamed-test';
  }

  return path.basename(testCaseInput, path.extname(testCaseInput));
}

module.exports = {
  resolveReportOutputDir,
  resolveTestName,
};