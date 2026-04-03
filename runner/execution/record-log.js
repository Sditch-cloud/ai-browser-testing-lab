'use strict';

const tools = require('../tools');

/**
 * Records a structured log entry for an internal service call or lifecycle event.
 * Log entries are accumulated in an in-memory array (the `logStore`) which is
 * passed by reference so orchestration and reporters can consume the full run history.
 *
 * @param {object}   params
 * @param {string}   params.event      - Name of the internal service or lifecycle event
 * @param {string}   params.status     - 'pass' | 'fail' | 'skip' | 'info'
 * @param {string}   [params.detail]   - Human-readable message
 * @param {object}   [params.data]     - Optional structured payload
 * @param {string}   [params.timestamp]- ISO-8601; defaults to Date.now()
 * @param {Array}    [params.logStore] - Shared array to append the entry to
 * @returns {{ logEntry: object }}
 */
async function recordLog({ event, status, detail = '', data = {}, timestamp, logStore }) {
  return tools.log.append({ event, status, detail, data, timestamp, logStore });
}

module.exports = { recordLog };
