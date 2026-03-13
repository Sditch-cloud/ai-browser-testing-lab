'use strict';

async function append({ event, status, detail = '', data = {}, timestamp, logStore }) {
  const validStatuses = ['pass', 'fail', 'skip', 'info'];

  if (!event) {
    throw new Error('log-recorder: "event" is required.');
  }

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

module.exports = { append };
