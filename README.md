# AI Browser Testing Lab

An AI-driven browser testing project with AI-facing tools, a modular Node.js runner, and a CLI backend.

---

## How it works

For AI-driven automated execution, use the public tools under `tools/runner/`.

See runner internal conventions: `runner/INTERNAL_NAMING.md`

Planned AI-facing tool wrapper:
- `tools/runner/run-test-case.js` (not yet present in this workspace)

Runtime backend:
- `runner/cli.js`

AI should not depend on internal implementation details under `runner/`.

### Example

> **User:** "Run the login test case"

AI invokes the public runner tool, which calls `runner/cli.js` and returns summary plus report paths.

---

## Project structure

```
.
├── .github/
│   └── copilot-instructions.md   # Rules that govern how Copilot orchestrates tests
│
├── runner/
│   ├── lifecycle/
│   │   ├── before-test.js        # Launch browser before first step
│   │   ├── after-test.js         # Close browser after last step
│   │   └── on-error.js           # Capture screenshot + decide abort/continue
│   ├── _lib/
│   │   ├── browser/              # Atomic browser operations (navigate/click/fill/...)
│   │   ├── assertion/            # Atomic assertion operations
│   │   ├── locator/              # Locator resolution primitives
│   │   ├── io/                   # YAML/JSON/HTML IO primitives
│   │   ├── log/                  # Log append primitive
│   │   └── shared/               # Shared low-level helpers (locator-utils)
│   ├── tools/
│   │   └── index.js              # Internal boundary over low-level _lib modules
│   ├── reporters/
│   │   ├── index.js              # JSON + HTML report orchestration
│   │   ├── json-reporter.js      # Machine-readable report writer
│   │   ├── html-reporter.js      # Human-readable report writer
│   │   └── utils.js              # Shared reporter helpers
│   ├── execution/
│   │   ├── resolve-descriptor-locator.js  # Shared locator preparation for steps/assertions
│   │   ├── run-step.js            # Deterministic step execution pipeline
│   │   └── run-assertions.js      # Assertion execution pipeline
│   ├── helpers/
│   │   ├── locator-utils.js       # Locator resolution helpers
│   │   ├── metadata-utils.js      # Metadata merge helpers
│   │   ├── navigation-utils.js    # Navigate URL normalization helpers
│   │   ├── path-utils.js          # Output and test naming helpers
│   │   ├── log-summary.js         # Runner summary helpers
│   │   └── index.js               # Convenience helper exports
│   ├── orchestration/
│   │   └── test-runner.js         # End-to-end test orchestrator
│   ├── runtime/
│   │   ├── create-runtime-state.js        # Per-run mutable state factory
│   │   ├── create-runner-dependencies.js  # Internal dependency assembly
│   │   └── parse-test-case.js             # YAML test case loading and normalization
│   ├── cli.js                    # CLI entry point for local execution
│   ├── index.js                  # Public runner exports
│   └── _services/
│       ├── assertion-executor/   # Assertion adapter over assertion tools
│       ├── log-recorder/         # Structured run log adapter
│       └── step-action-executor/ # Step action adapter over browser tools
│
├── tests/
│   ├── cases/
│   │   ├── login.yaml            # Login test case definition
│   │   └── search.yaml           # Search test case definition
│   ├── ai-tools.test.js          # Public AI-facing tool wrapper tests
│   └── runner.test.js            # Runner and CLI tests with injected fakes
│
├── rules/
│   ├── test-orchestration.md     # Orchestration rules placeholder (TBD)
│   └── skill-usage.md            # Skill conventions placeholder (TBD)
│
├── reports/                      # Generated reports (gitignored except .gitkeep)
├── package.json
└── README.md
```

---

## Skills

Reserved for future implementation details.

TBD

---

## Tools

Public AI-facing tools are planned under `tools/`.

Planned public tool:
- `tools/runner/run-test-case.js`: wraps `runner/cli.js` for AI-safe test execution

---

## Hooks

Reserved for future implementation details.

TBD

---

## Test cases

Test cases are YAML files in `tests/cases/`. Example structure:

```yaml
metadata:
  name: login
  description: Verify user can log in with valid credentials
  author: AI Browser Testing Lab
  tags: [auth, smoke]
  baseUrl: https://example.com
  timeout: 30000
  continueOnFail: false

steps:
  - type: navigate
    url: https://example.com/login
  - type: fill
    target: username field
    value: student
  - type: click
    testId: login-submit

assertions:
  - type: url-contains
    expected: /dashboard/
  - type: element-visible
    testId: welcome-message
```

Locators can be supplied in several forms:

- `selector` for explicit CSS selectors
- `testId` for stable `data-testid` attributes
- `label`, `role` + `name`, `text`, or `placeholder` for semantic locators
- `target` for natural-language descriptions that are resolved against the live page

The parser also remains backward-compatible with the existing flat YAML shape used in `tests/cases/*.yaml`, so you do not need to rewrite current cases.

---

## Rules

Current rule is simple: AI invokes tests through `tools/runner/`, and those tools delegate to `runner/cli.js`.

Detailed lifecycle/internal-service/internal-library conventions are reserved for later and are currently TBD.

---

## Prerequisites

- Node.js >= 18
- GitHub Copilot with Agent mode enabled in your editor

---

## Setup

```bash
npm install
```

## Running a test from the CLI

```bash
npm run run:test -- login
```

You can also target a file path directly:

```bash
node runner/cli.js tests/cases/search.yaml --headed --report-dir reports
```

Supported options:

- `--case-dir <dir>` to override the default `tests/cases` search directory
- `--report-dir <dir>` to override the output folder for HTML and JSON reports
- `--base-url <url>` to override `metadata.baseUrl`
- `--timeout <ms>` to override `metadata.timeout`
- `--headless` or `--headed` to control browser mode
- `--slow-mo <ms>` to add Playwright delay for debugging

---

## Running the runner unit tests

Run the runner and CLI tests:

```bash
npm run test:runner
```

Run the AI-facing tool wrapper tests:

```bash
npm run test:ai-tools
```

---

## Triggering a test via Copilot Chat

1. Open Copilot Chat in VS Code (or GitHub.com).
2. Type a message such as:
   - `Run the login test case`
   - `Execute the search test`
   - `Run all smoke tests`
3. Copilot Agent executes through the public tool wrapper in `tools/runner/`, which delegates to `runner/cli.js`.
