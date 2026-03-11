# Test Orchestration Rules

This document describes how the Copilot Agent must orchestrate a full browser
test run. These rules supplement the concise version in
`.github/copilot-instructions.md`.

---

## Workflow Diagram

```
User Chat Message
       │
       ▼
┌──────────────────────────────┐
│  1. Resolve test case name   │  -> Search tests/cases/ for <name>.yaml
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  2. parse-testcase skill     │  -> Returns { metadata, steps, assertions }
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  3. before-test hook         │  -> Launches browser, returns { page, ... }
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  4. resolve-locator skill    │  -> Only for selector-free steps/assertions
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       │  For each step │
       └───────┬────────┘
               │
               ▼
┌──────────────────────────────┐
│  5. browser-action skill     │  -> Executes one step
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  6. assert skill             │  -> Evaluates assertions for this step
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  7. log-recorder skill       │  -> Appends to logStore[]
└──────────────┬───────────────┘
               │
       ┌───────┴────────────────────────────────┐
       │  On step error -> on-error hook        │
       └────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│  8. after-test hook          │  -> Closes browser
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  9. report-generator skill   │  -> Writes .json and .html to reports/
└──────────────┬───────────────┘
               │
               ▼
       Chat Response Summary
```

---

## Decision Points

### When a step fails

1. Invoke `on-error` hook to capture a screenshot.
2. Call `log-recorder` with `status: 'fail'`.
3. Check `metadata.continueOnFail`:
   - `true` -> continue to the next step.
   - `false` -> skip remaining steps, jump to `after-test` hook.

### When an assertion fails

- Check `assertion.continueOnFail`:
  - `true` -> log failure and continue.
  - `false` -> treat as step failure (see above).

### When the test file is not found

- Report to the user in chat and do not proceed.
- Do not invoke any skills or hooks.

---

## State Threading

The `context` object (returned by `before-test`) must be passed unchanged to
every `resolve-locator`, `browser-action`, and `assert` skill call. This
object contains the live Playwright `page` reference and must not be mutated by
the agent.

When a step or assertion omits `selector`, the agent should invoke
`resolve-locator` with the original descriptor and the same `context` before
execution. Explicit locator fields such as `testId`, `label`, `role` + `name`,
and `text` should be preserved exactly as authored.

The `logStore` is a plain JavaScript array `[]` created at the start of the
run and passed by reference to every `log-recorder` call. It is finally
handed to `report-generator`.
