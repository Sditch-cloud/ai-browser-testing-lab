'use strict';

/**
 * Skill: report-generator
 *
 * Takes the accumulated log entries for a test run and writes two report files:
 *   1. <testName>-<timestamp>.json  – machine-readable results
 *   2. <testName>-<timestamp>.html  – human-readable HTML report
 *
 * Usage (invoked by Copilot Agent):
 *   const { jsonPath, htmlPath, summary } = await reportGenerator({
 *     testName: 'login',
 *     metadata,
 *     logs,
 *     outputDir: 'reports',
 *   });
 */

const fs = require('fs');
const path = require('path');

/**
 * @param {object}   params
 * @param {string}   params.testName   - Name of the test
 * @param {object}   [params.metadata] - Test case metadata
 * @param {Array}    params.logs       - Log entries from log-recorder
 * @param {string}   [params.outputDir]- Output directory (default: reports)
 * @returns {{ jsonPath, htmlPath, summary }}
 */
async function reportGenerator({ testName, metadata = {}, logs = [], outputDir = 'reports' }) {
  if (!testName) throw new Error('report-generator: "testName" is required.');

  const rootDir = path.resolve(__dirname, '..', '..');
  const outDir = path.resolve(rootDir, outputDir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFileName = `${testName}-${timestamp}`;

  const passed = logs.filter((l) => l.status === 'pass').length;
  const failed = logs.filter((l) => l.status === 'fail').length;
  const skipped = logs.filter((l) => l.status === 'skip').length;
  const total = logs.length;

  const startTime = logs[0]?.timestamp ? new Date(logs[0].timestamp).getTime() : Date.now();
  const endTime = logs[logs.length - 1]?.timestamp
    ? new Date(logs[logs.length - 1].timestamp).getTime()
    : Date.now();
  const duration = endTime - startTime;

  const summary = { total, passed, failed, skipped, duration };

  const jsonReport = {
    testName,
    metadata,
    summary,
    generatedAt: new Date().toISOString(),
    logs,
  };

  const jsonPath = path.join(outDir, `${baseFileName}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf8');

  const htmlPath = path.join(outDir, `${baseFileName}.html`);
  fs.writeFileSync(htmlPath, buildHtml(testName, metadata, summary, logs), 'utf8');

  return { jsonPath, htmlPath, summary };
}

function buildHtml(testName, metadata, summary, logs) {
  const statusColor = summary.failed > 0 ? '#c0392b' : '#27ae60';
  const overallLabel = summary.failed > 0 ? '❌ FAILED' : '✅ PASSED';

  const rows = logs
    .map((entry) => {
      const color =
        entry.status === 'pass'
          ? '#27ae60'
          : entry.status === 'fail'
          ? '#c0392b'
          : entry.status === 'skip'
          ? '#f39c12'
          : '#2980b9';
      return `
      <tr>
        <td>${escapeHtml(entry.timestamp)}</td>
        <td>${escapeHtml(entry.event)}</td>
        <td style="color:${color};font-weight:bold">${escapeHtml(entry.status.toUpperCase())}</td>
        <td>${escapeHtml(entry.detail)}</td>
      </tr>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Report – ${escapeHtml(testName)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #222; }
    h1 { margin-bottom: 0.25rem; }
    .badge { display:inline-block; padding:.3rem .8rem; border-radius:4px;
             color:#fff; background:${statusColor}; font-size:1.1rem; }
    .meta { color:#555; margin-bottom:1.5rem; }
    .summary { display:flex; gap:2rem; margin-bottom:2rem; }
    .stat { text-align:center; }
    .stat .num { font-size:2rem; font-weight:bold; }
    table { border-collapse:collapse; width:100%; }
    th { background:#f0f0f0; text-align:left; padding:.5rem .75rem; }
    td { border-top:1px solid #ddd; padding:.5rem .75rem; vertical-align:top; }
    tr:hover td { background:#fafafa; }
  </style>
</head>
<body>
  <h1>${escapeHtml(testName)} <span class="badge">${overallLabel}</span></h1>
  <p class="meta">
    ${escapeHtml(metadata.description || '')}
    &nbsp;|&nbsp; Author: ${escapeHtml(metadata.author || 'unknown')}
    &nbsp;|&nbsp; Tags: ${(metadata.tags || []).map(escapeHtml).join(', ')}
  </p>

  <div class="summary">
    <div class="stat"><div class="num">${summary.total}</div>Total</div>
    <div class="stat" style="color:#27ae60"><div class="num">${summary.passed}</div>Passed</div>
    <div class="stat" style="color:#c0392b"><div class="num">${summary.failed}</div>Failed</div>
    <div class="stat" style="color:#f39c12"><div class="num">${summary.skipped}</div>Skipped</div>
    <div class="stat"><div class="num">${(summary.duration / 1000).toFixed(2)}s</div>Duration</div>
  </div>

  <table>
    <thead>
      <tr><th>Timestamp</th><th>Event</th><th>Status</th><th>Detail</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { reportGenerator };
