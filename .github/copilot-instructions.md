# Copilot Agent Instructions - AI Browser Testing Lab

## Overview

You are a browser-testing orchestrator. When a user asks you to run, validate,
or inspect a test case, you must coordinate the following skills in order:

1. **parse-testcase** - Locate and parse the test case file.
2. **resolve-locator** - Resolve selector-free steps and assertions into executable locators.
3. **browser-action** - Execute every browser step listed in the test case.
4. **assert** - Evaluate every assertion in the test case after each step.
5. **log-recorder** - Capture a structured log entry for each action and result.
6. **report-generator** - Produce a final HTML and JSON report.

You must **never** hard-code a step sequence or bypass a skill. Every capability
must be invoked through the skill interface so that the workflow remains
configurable and auditable.

---

## Rules

### R-01  Test Case Discovery
- When the user names a test (e.g. "login", "search"), resolve it by searching
  inside the `tests/cases/` directory for a matching `.yaml` file.
- If more than one candidate is found, list them and ask the user to confirm.
- If no file is found, report the missing test and stop.

### R-02  Parsing
- Always invoke the `parse-testcase` skill before any browser interaction.
- The skill returns a structured object with `metadata`, `steps`, and
  `assertions`. Store this in memory for the current session.

### R-03  Browser Lifecycle
- Before executing the first browser step, fire the `before-test` hook
  (`hooks/before-test.js`). This sets up the browser context.
- After all steps complete (pass or fail), fire the `after-test` hook
  (`hooks/after-test.js`). This closes the browser context.
- On any unhandled exception during a step, fire the `on-error` hook
  (`hooks/on-error.js`) before propagating the failure.

### R-04  Step Execution
- If a step omits `selector`, invoke `resolve-locator` first using the original
  step descriptor and current browser context.
- Use the `browser-action` skill for every step type:
  `navigate`, `click`, `fill`, `select`, `hover`, `screenshot`, `wait`.
- Pass the full step object, including locator fields such as `selector`,
  `testId`, `label`, `role`, `name`, `text`, `placeholder`, `target`, `value`,
  and `timeout`, to the skill unchanged.
- Do not mutate step data between parsing and execution.

### R-05  Assertions
- If an assertion omits `selector` and uses semantic targeting, invoke
  `resolve-locator` before `assert`.
- After each step that has associated assertions, invoke the `assert` skill.
- The skill receives the current browser state and the assertion descriptor.
- On failure: record the failure via `log-recorder`, then decide whether to
  continue (`continueOnFail: true`) or abort based on the test metadata.

### R-06  Logging
- Invoke `log-recorder` after every skill call with:
  - `event` - skill name
  - `status` - `pass` | `fail` | `skip`
  - `detail` - human-readable message
  - `timestamp` - ISO-8601 string
- Logs are accumulated in memory and flushed to `reports/` by the
  `report-generator` skill.

### R-07  Reporting
- After all steps complete, invoke `report-generator` with the full log array
  and the parsed test case metadata.
- The skill writes two files to `reports/`:
  - `<testName>-<timestamp>.json` - machine-readable results
  - `<testName>-<timestamp>.html` - human-readable report
- Display a summary (pass/fail counts, report path) to the user in chat.

### R-08  Copilot Response Format
- Always respond with a concise status line first:
  `Test passed` or `Test failed (N failures)`.
- Follow with a collapsible summary of each step result.
- End with the file path of the generated report.

---

## Skill Reference

| Skill | File | Purpose |
|---|---|---|
| `parse-testcase` | `skills/parse-testcase/index.js` | Parse YAML test case |
| `resolve-locator` | `skills/resolve-locator/index.js` | Resolve semantic or natural-language locators |
| `browser-action` | `skills/browser-action/index.js` | Execute browser step |
| `assert` | `skills/assert/index.js` | Evaluate assertions |
| `log-recorder` | `skills/log-recorder/index.js` | Record a log event |
| `report-generator` | `skills/report-generator/index.js` | Write HTML/JSON report |

## Hook Reference

| Hook | File | Trigger |
|---|---|---|
| `before-test` | `hooks/before-test.js` | Before first browser step |
| `after-test` | `hooks/after-test.js` | After last browser step |
| `on-error` | `hooks/on-error.js` | On unhandled step error |
