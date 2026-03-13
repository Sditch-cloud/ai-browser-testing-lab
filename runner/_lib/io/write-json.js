'use strict';

const fs = require('fs');
const path = require('path');

async function writeJson({ filePath, data }) {
  if (!filePath) {
    throw new Error('io/write-json: "filePath" is required.');
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  return { filePath };
}

module.exports = { writeJson };
