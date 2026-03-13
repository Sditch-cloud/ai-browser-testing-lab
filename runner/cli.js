#!/usr/bin/env node
'use strict';

const path = require('path');
const { runTestCase } = require('./orchestration/test-runner');

function printUsage() {
  console.log('Usage: node runner/cli.js <test-name-or-path> [options]');
  console.log('Options:');
  console.log('  --case-dir <dir>     Override test case directory (default: tests/cases)');
  console.log('  --report-dir <dir>   Override report output directory (default: reports)');
  console.log('  --base-url <url>     Override metadata.baseUrl');
  console.log('  --timeout <ms>       Override metadata.timeout');
  console.log('  --headless           Run browser in headless mode (default)');
  console.log('  --headed             Run browser with UI');
  console.log('  --slow-mo <ms>       Slow down browser actions for debugging');
  console.log('  --help               Show this message');
}

function isFilePath(input) {
  return /[\\/]/.test(input) || /\.ya?ml$/i.test(input);
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    headless: true,
  };
  let testCaseInput = null;

  while (args.length > 0) {
    const token = args.shift();

    if (!token) {
      continue;
    }

    if (!token.startsWith('--') && !testCaseInput) {
      testCaseInput = token;
      continue;
    }

    switch (token) {
      case '--case-dir':
        options.casesDir = args.shift();
        break;
      case '--report-dir':
        options.reportDir = args.shift();
        break;
      case '--base-url':
        options.baseUrl = args.shift();
        break;
      case '--timeout':
        options.timeout = Number(args.shift());
        break;
      case '--slow-mo':
        options.slowMo = Number(args.shift());
        break;
      case '--headed':
        options.headless = false;
        break;
      case '--headless':
        options.headless = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (testCaseInput && isFilePath(testCaseInput)) {
    options.filePath = path.isAbsolute(testCaseInput)
      ? testCaseInput
      : path.join(process.cwd(), testCaseInput);
  }

  return { testCaseInput, options };
}

async function main(argv = process.argv.slice(2), dependencies = { runTestCase }) {
  let parsedArgs;

  try {
    parsedArgs = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    printUsage();
    return 1;
  }

  if (parsedArgs.options.help || !parsedArgs.testCaseInput) {
    printUsage();
    return parsedArgs.options.help ? 0 : 1;
  }

  try {
    const result = await dependencies.runTestCase(parsedArgs.testCaseInput, parsedArgs.options);
    const statusLine = result.passed
      ? 'Test passed'
      : `Test failed (${result.summary.failed} failures)`;

    console.log(statusLine);
    console.log(`Steps logged: ${result.summary.total}`);
    console.log(`JSON report: ${result.jsonPath}`);
    console.log(`HTML report: ${result.htmlPath}`);
    return result.passed ? 0 : 1;
  } catch (error) {
    console.error(`Test failed (runner error): ${error.message}`);
    return 1;
  }
}

if (require.main === module) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  });
}

module.exports = {
  isFilePath,
  main,
  parseArgs,
  printUsage,
};