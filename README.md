# AI Browser Testing Lab

An AI-driven browser testing project orchestrated entirely by **GitHub Copilot Agent** using **Skills**, **Hooks**, and **Rules** — no fixed test-runner script.

---

## How it works

Instead of a traditional CI script that runs tests in sequence, this lab defines atomic **Skills** that Copilot Agent can call, **Rules** that tell it *how* to orchestrate those calls, and **Hooks** that handle lifecycle events. The workflow is triggered directly from **Copilot Chat**.

### Example

> **User:** "Run the login test case"

Copilot Agent then:

1. Searches `tests/cases/` for `login.yaml` → invokes **parse-testcase** skill
2. Fires the **before-test** hook → launches a Playwright browser
3. Iterates over each step → invokes **browser-action** skill
4. After each step → invokes **assert** skill for any associated assertions
5. After each skill call → invokes **log-recorder** skill to accumulate results
6. On any error → fires the **on-error** hook (screenshot + decide abort/continue)
7. Fires the **after-test** hook → closes the browser
8. Invokes **report-generator** → writes `reports/<name>-<timestamp>.html` and `.json`
9. Replies to the user with a ✅/❌ summary and the report file path

---

## Project structure

```
.
├── .github/
│   └── copilot-instructions.md   # Rules that govern how Copilot orchestrates tests
│
├── skills/
│   ├── parse-testcase/           # Parse a YAML test case definition
│   │   ├── index.js
│   │   └── schema.json           # Skill input/output schema
│   ├── browser-action/           # Execute a single browser step via Playwright
│   │   ├── index.js
│   │   └── schema.json
│   ├── assert/                   # Evaluate an assertion against browser state
│   │   ├── index.js
│   │   └── schema.json
│   ├── log-recorder/             # Record a structured log entry
│   │   ├── index.js
│   │   └── schema.json
│   └── report-generator/         # Write HTML + JSON reports
│       ├── index.js
│       └── schema.json
│
├── hooks/
│   ├── before-test.js            # Launch browser before first step
│   ├── after-test.js             # Close browser after last step
│   └── on-error.js               # Capture screenshot + decide abort/continue
│
├── tests/
│   ├── cases/
│   │   ├── login.yaml            # Login test case definition
│   │   └── search.yaml           # Search test case definition
│   └── skills.test.js            # Unit tests for skills (no browser required)
│
├── rules/
│   ├── test-orchestration.md     # Detailed workflow diagram and decision logic
│   └── skill-usage.md            # Input/output reference for each skill
│
├── reports/                      # Generated reports (gitignored except .gitkeep)
├── package.json
└── README.md
```

---

## Skills

| Skill | Purpose |
|---|---|
| `parse-testcase` | Read `tests/cases/<name>.yaml` and return `{ metadata, steps, assertions }` |
| `browser-action` | Execute one step: `navigate`, `click`, `fill`, `select`, `hover`, `screenshot`, `wait` |
| `assert` | Evaluate: `url-contains`, `title-equals`, `element-visible`, `element-text`, `element-count`, `attribute-equals` |
| `log-recorder` | Append a structured entry to the run's log store |
| `report-generator` | Write `<name>-<ts>.html` and `<name>-<ts>.json` to `reports/` |

Each skill lives in `skills/<name>/index.js` and is described by a JSON schema in `skills/<name>/schema.json`.

---

## Hooks

| Hook | File | Trigger |
|---|---|---|
| `before-test` | `hooks/before-test.js` | Before the first browser step |
| `after-test` | `hooks/after-test.js` | After the last browser step (always fires) |
| `on-error` | `hooks/on-error.js` | When a step throws an unhandled exception |

---

## Test cases

Test cases are YAML files in `tests/cases/`. Example structure:

```yaml
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
    selector: "#username"
    value: student
  - type: click
    selector: "#submit"

assertions:
  - type: url-contains
    expected: /dashboard/
  - type: element-visible
    selector: ".welcome-message"
```

---

## Rules

Copilot's orchestration behaviour is governed by two layers of rules:

- **`.github/copilot-instructions.md`** – concise, always-loaded rules (R-01 through R-08)
- **`rules/test-orchestration.md`** – full workflow diagram and decision logic
- **`rules/skill-usage.md`** – input/output reference for each skill

---

## Prerequisites

- Node.js ≥ 18
- GitHub Copilot with Agent mode enabled in your editor

---

## Setup

```bash
npm install
```

---

## Running the skill unit tests

The skills can be exercised without a live browser:

```bash
npm run test:skills
```

---

## Triggering a test via Copilot Chat

1. Open Copilot Chat in VS Code (or GitHub.com).
2. Type a message such as:
   - `Run the login test case`
   - `Execute the search test`
   - `Run all smoke tests`
3. Copilot Agent will orchestrate the full workflow as described above.
