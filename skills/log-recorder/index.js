'use strict';

/**
 * Skill: log-recorder
 *
 * Records a structured log entry for a skill invocation or lifecycle event.
 * Log entries are accumulated in an in-memory array (the `logStore`) which is
 * passed by reference so that report-generator can flush the full run history.
 *
 * Usage (invoked by Copilot Agent):
 *   const { logEntry } = await logRecorder({
 *     event: 'browser-action:click',
 *     status: 'pass',
 *     detail: 'Clicked the submit button',
 *     logStore,           // shared array for this test run
 *   });
 */

/**
 * @param {object}   params
 * @param {string}   params.event      - Name of the skill or event
 * @param {string}   params.status     - 'pass' | 'fail' | 'skip' | 'info'
 * @param {string}   [params.detail]   - Human-readable message
 * @param {object}   [params.data]     - Optional structured payload
 * @param {string}   [params.timestamp]- ISO-8601; defaults to Date.now()
 * @param {Array}    [params.logStore] - Shared array to append the entry to
 * @returns {{ logEntry: object }}
 */
async function logRecorder({ event, status, detail = '', data = {}, timestamp, logStore }) {
  const validStatuses = ['pass', 'fail', 'skip', 'info'];
  if (!event) throw new Error('log-recorder: "event" is required.');
  if (!validStatuses.includes(status)) {
    throw new Error(`log-recorder: "status" must be one of ${validStatuses.join(', ')}.`);
  }

  const logEntry = {
    event,
    status,
    detail,
    data,
    timestamp: timestamp || new Date().toISOString(),
  };

  if (Array.isArray(logStore)) {
    logStore.push(logEntry);
  }

  return { logEntry };
}

module.exports = { logRecorder };
