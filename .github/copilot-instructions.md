# Copilot Agent Instructions - AI Browser Testing Lab

## Overview

When running automated tests, the AI should use the public tool wrapper in `tools/runner/`, which invokes `runner/cli.js`.

Runtime backend:
- `runner/index.js` exports `runTestCase` (called by CLI)

The AI must not depend on internal implementation details under `runner/`.
This includes direct orchestration of hooks, rules, skills, tools, step pipeline,
or assertion pipeline internals.

---

## Execution Contract

1. For test execution requests, use the public tool wrapper under `tools/runner/`.
2. Do not call internal modules directly (for example files under `runner/lifecycle/`,
    `runner/_services/`, `runner/tools/`, `runner/_lib/`, `runner/orchestration/test-runner.js`,
    `runner/execution/run-step.js`, or `runner/execution/run-assertions.js`).
3. Treat `tools/runner/` as the stable AI-facing entrypoint.
4. If a requested capability is not exposed by CLI options, report the limitation.

---

## Response Contract

- Start with: `Test passed` or `Test failed (N failures)`.
- Then provide a concise summary.
- End with report path(s) when available.

---

## Reserved Sections (TBD)

### Hook Reference
TBD

### Rule Reference
TBD

### Skill Reference
TBD

### Tool Reference
TBD
