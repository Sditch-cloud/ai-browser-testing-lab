# Runner Architecture

## Overview

The runner is a layered test execution engine that drives Playwright browser automation
from a declarative YAML test case. It exposes two entry points and is structured into
seven internal layers with a strict, one-directional dependency flow.

```
┌─────────────────────────────────────────────────────┐
│                   Entry Points                      │
│         index.js (API)  │  cli.js (CLI)             │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Orchestration Layer                    │
│           orchestration/test-runner.js              │
└──────┬──────────┬──────────┬──────────┬─────────────┘
       │          │          │          │
┌──────▼──┐ ┌─────▼───┐ ┌────▼────┐ ┌───▼──────┐
│ Runtime │ │Execution│ │Lifecycle│ │Reporters │
└──────┬──┘ └─────┬───┘ └────┬────┘ └───┬──────┘
       │          │          │          │
       └──────────┴──────────┘          │
                  │                     │
┌─────────────────▼─────────────────────▼─────────────┐
│               Tools Layer                           │
│    tools/ (browser · assertion · locator · io · log)│
└─────────────────────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│               Helpers Layer                          │
│  helpers/ (pure utilities, no I/O, no side effects)  │
└──────────────────────────────────────────────────────┘
```

---

## Entry Points

### `index.js`
Programmatic API. Exports `runTestCase` for use as a Node.js module.

```js
const { runTestCase } = require('./runner');
const result = await runTestCase('login', { headless: true });
```

### `cli.js`
Command-line entry point. Parses `process.argv`, calls `runTestCase`, and exits with
`0` on success or `1` on failure.

```
node runner/cli.js login --headed --report-dir ./reports
node runner/cli.js tests/cases/login.yaml --base-url http://localhost:5173
```

**CLI options**

| Option | Description |
|---|---|
| `--case-dir <dir>` | Override test case directory (default: `tests/cases`) |
| `--report-dir <dir>` | Override report output directory (default: `reports`) |
| `--base-url <url>` | Override `metadata.baseUrl` from YAML |
| `--timeout <ms>` | Override `metadata.timeout` |
| `--headless` | Run browser headless (default) |
| `--headed` | Run browser with visible UI |
| `--slow-mo <ms>` | Slow down browser actions (useful for debugging) |

---

## Layer Reference

### Orchestration — `orchestration/`

**`test-runner.js`** — Single entry point for a complete test run. Calls every other
layer in sequence and returns a unified result object.

Execution order:
1. `createRunnerDependencies` → assemble `skills`, `hooks`, `reporters` bags
2. `skills.parseTestCase` → load and normalize YAML test case
3. `hooks.beforeTest` → launch browser, create context and page
4. `runStep` × N → execute each step in declaration order
5. `runAssertions` → execute all assertions (inline + standalone)
6. `hooks.afterTest` → close browser resources
7. `reporters.json` + `reporters.html` → write report files

If a step fails and `metadata.continueOnFail` is `false`, execution aborts after
`hooks.onError` captures a screenshot. Assertions are skipped.

---

### Runtime — `runtime/`

Responsible for test case loading, dependency wiring, and per-run state.

| File | Responsibility |
|---|---|
| `parse-test-case.js` | Reads and normalizes a YAML file into `{ metadata, steps, assertions }` |
| `create-runner-dependencies.js` | Dependency injection factory — assembles the `skills`, `hooks`, and `reporters` bags consumed by the orchestrator |
| `create-runtime-state.js` | Creates the mutable per-run state object: `{ metadata, context, logStore, stepResults, assertionResults, timing, aborted, … }` |

**Dependency injection** (`create-runner-dependencies.js`)

All injectable names are accepted in both the new canonical form and legacy aliases,
so tests and integrations can migrate independently:

| Canonical name | Legacy alias |
|---|---|
| `skills.executeStepAction` | `skills.browserAction` |
| `skills.executeAssertion` | `skills.assert` |
| `skills.recordLog` | `skills.logRecorder` |

---

### Execution — `execution/`

Step-level and assertion-level execution pipeline. Each file has a single, focused
responsibility.

| File | Responsibility |
|---|---|
| `run-step.js` | URL normalization → locator prep → `skills.executeStepAction` → log → abort decision |
| `run-assertions.js` | Collects inline + standalone assertions → locator prep → `skills.executeAssertion` → log → `continueOnFail` |
| `resolve-descriptor-locator.js` | Shared locator preparation used by both `run-step` and `run-assertions` |
| `resolve-locator.js` | Thin adapter: calls `tools.locator.resolve` with the descriptor and context |
| `execute-step-action.js` | Dispatches to `tools.browser[action.type]`; normalizes errors into result shape |
| `execute-assertion.js` | Dispatches to `tools.assertion[assertion.type]`; normalizes errors into result shape |
| `record-log.js` | Appends a structured entry to the shared `logStore` via `tools.log.append` |

**Locator resolution flow**

```
descriptor (step or assertion)
        │
        ▼
needsLocatorResolution?   ──No──▶  use descriptor as-is
        │ Yes
        ▼
skills.resolveLocator({ descriptor, context })
        │
        ▼
applyResolvedLocator(descriptor, resolved)
        │
        ▼
enriched descriptor passed to executeStepAction / executeAssertion
```

Descriptors that already contain an explicit locator field (`selector`, `testId`,
`label`, `role`, `text`, …) skip AI resolution entirely.

---

### Lifecycle — `lifecycle/`

Browser resource management and error recovery, called by the orchestrator via the
injected `hooks` bag.

| File | Exports | Responsibility |
|---|---|---|
| `before-test.js` | `beforeTest` | Launches Chromium, creates context (1280×800) and page; returns `{ browser, browserContext, page, startedAt }` |
| `after-test.js` | `afterTest` | Closes page → context → browser with per-step try/catch; returns `{ endedAt, durationMs }` |
| `on-error.js` | `onError` | Captures a screenshot on step failure; returns `{ screenshotPath, errorMessage, shouldAbort }` where `shouldAbort = !metadata.continueOnFail` |

---

### Reporters — `reporters/`

Converts the completed runtime state into persisted report files.

| File | Responsibility |
|---|---|
| `json-reporter.js` | Writes a structured JSON report; also writes `reports/latest-run-<name>.json` |
| `html-reporter.js` | Renders a self-contained HTML report using `tools.io.writeHtml` |
| `utils.js` | Shared formatting utilities (durations, status badges, etc.) |
| `index.js` | Re-exports `{ generateJsonReport, generateHtmlReport }` |

---

### Tools — `tools/`

Low-level Playwright primitives. All modules above this layer import exclusively
through `tools/index.js`. Direct access to sub-modules from outside `tools/` is
prohibited.

```
tools/
├── index.js          ← single import boundary
├── browser/          ← Playwright page actions (click, fill, navigate, …)
│   ├── click.js
│   ├── fill.js
│   ├── hover.js
│   ├── navigate.js
│   ├── screenshot.js
│   ├── select.js
│   ├── wait.js
│   └── index.js
├── assertion/        ← assertion handlers keyed by type string
│   ├── attribute-equals.js
│   ├── element-count.js
│   ├── element-text.js
│   ├── element-visible.js
│   ├── title-equals.js
│   ├── url-contains.js
│   └── index.js
├── locator/          ← AI-based locator resolution engine
│   ├── resolve.js
│   └── index.js
├── io/               ← File I/O (YAML read, HTML/JSON write)
│   ├── read-yaml.js
│   ├── write-html.js
│   ├── write-json.js
│   └── index.js
├── log/              ← Log entry creation and accumulation
│   ├── append.js
│   └── index.js
└── shared/
    └── locator-utils.js   ← Shared scoring/candidate logic used by assertion and locator modules
```

**Supported browser action types** (registered in `tools/browser/index.js`)

`navigate` · `click` · `fill` · `select` · `hover` · `wait` · `screenshot`

**Supported assertion types** (registered in `tools/assertion/index.js`)

`element-visible` · `element-text` · `element-count` · `attribute-equals` · `title-equals` · `url-contains`

---

### Helpers — `helpers/`

Pure utility functions with no I/O and no side effects. Safe to call from any layer.

| File | Exports |
|---|---|
| `locator-utils.js` | `needsLocatorResolution`, `applyResolvedLocator`, `hasExplicitLocator` |
| `navigation-utils.js` | `resolveNavigateStepUrl` — resolves relative URLs against `metadata.baseUrl` |
| `metadata-utils.js` | `mergeRuntimeMetadata` — merges YAML metadata with CLI option overrides |
| `path-utils.js` | `resolveReportOutputDir`, `resolveTestName` |
| `log-summary.js` | `summarizeRunnerLogs` — aggregates log entries into pass/fail counts |
| `index.js` | Re-exports all of the above |

---

## Data Flow

```
CLI args / programmatic call
        │
        ▼
  parseArgs (cli.js)
        │
        ▼
  runTestCase(testCaseInput, options, customDependencies)
        │
        ├─► createRunnerDependencies  ──► skills bag (parseTestCase, resolveLocator,
        │                                              executeStepAction, executeAssertion,
        │                                              recordLog)
        │                             ──► hooks bag  (beforeTest, afterTest, onError)
        │                             ──► reporters  (json, html)
        │
        ├─► skills.parseTestCase ──► { metadata, steps[], assertions[] }
        │
        ├─► mergeRuntimeMetadata ──► mergedMetadata
        │
        ├─► createRuntimeState   ──► runtimeState
        │
        ├─► hooks.beforeTest     ──► context { browser, browserContext, page }
        │
        ├─► runStep × N
        │       ├── resolveNavigateStepUrl
        │       ├── prepareDescriptorWithLocator (→ skills.resolveLocator)
        │       ├── skills.executeStepAction (→ tools.browser[type])
        │       ├── skills.recordLog
        │       └── hooks.onError  (on failure)
        │
        ├─► runAssertions
        │       ├── collectAssertionQueue (inline + standalone)
        │       ├── prepareDescriptorWithLocator (→ skills.resolveLocator)
        │       ├── skills.executeAssertion (→ tools.assertion[type])
        │       └── skills.recordLog
        │
        ├─► hooks.afterTest      ──► { endedAt, durationMs }
        │
        ├─► reporters.generateJsonReport
        └─► reporters.generateHtmlReport
```

---

## Runtime State Object

`createRuntimeState` returns the following shape. It is mutated in-place throughout
the orchestration:

```js
{
  metadata: { name, baseUrl, timeout, continueOnFail, … },
  options:  { headless, slowMo, reportDir, … },
  context:  { browser, browserContext, page, startedAt },  // set by beforeTest
  logStore: [],            // appended by recordLog
  stepResults: [],         // appended by runStep
  assertionResults: [],    // appended by runAssertions
  timing: {},              // filled by afterTest
  generatedAt: Date,
  aborted: false,
  failureReason: null,
}
```

---

## Adding a New Browser Action

1. Create `tools/browser/<action-name>.js` exporting `async function <camelCase>({ action, context })`.
2. Register it in `tools/browser/index.js`.
3. Add the type string to `STEP_TYPES_WITH_LOCATOR` in `helpers/locator-utils.js` if
   the action targets a DOM element.

## Adding a New Assertion Type

1. Create `tools/assertion/<type-name>.js` exporting `async function <camelCase>({ assertion, context })`.
2. Register it in `tools/assertion/index.js` using the kebab-case type string as key.
3. Add the type string to `ASSERTION_TYPES_WITH_LOCATOR` in `helpers/locator-utils.js`
   if the assertion targets a DOM element.
