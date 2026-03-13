'use strict';

/**
 * Produces the summary block written into reports and returned to callers.
 * Timing data from lifecycle hooks is preferred, with a timestamp fallback for
 * tests that stub hook behavior.
 *
 * @param {Array<object>} logs
 * @param {object} timing
 * @returns {{total: number, passed: number, failed: number, skipped: number, duration: number}}
 */
function summarizeRunnerLogs(logs = [], timing = {}) {
  const passed = logs.filter((entry) => entry.status === 'pass').length;
  const failed = logs.filter((entry) => entry.status === 'fail').length;
  const skipped = logs.filter((entry) => entry.status === 'skip').length;
  const total = logs.length;

  let duration = timing.durationMs;
  if (typeof duration !== 'number') {
    const start = logs[0] && logs[0].timestamp ? Date.parse(logs[0].timestamp) : Date.now();
    const end = logs[logs.length - 1] && logs[logs.length - 1].timestamp
      ? Date.parse(logs[logs.length - 1].timestamp)
      : Date.now();
    duration = Math.max(0, end - start);
  }

  return { total, passed, failed, skipped, duration };
}

module.exports = {
  summarizeRunnerLogs,
};