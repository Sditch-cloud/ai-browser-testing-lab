'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

async function readYaml({ filePath }) {
  if (!filePath) {
    throw new Error('io/read-yaml: "filePath" is required.');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`io/read-yaml: File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(raw);

  return { data };
}

module.exports = { readYaml };
