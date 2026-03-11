# Skill Usage Guide

This document describes when and how to invoke each skill in the
AI Browser Testing Lab.

---

## parse-testcase

**When to use:** Once, at the very beginning of every test run.

**Input:**
```json
{
  "testName": "login",
  "casesDir": "tests/cases"
}
```

**Output:**
```json
{
  "metadata": { "name": "login", "continueOnFail": false, "timeout": 30000 },
  "steps": [ { "type": "navigate", "url": "https://..." }, ... ],
  "assertions": [ { "type": "url-contains", "expected": "/logged-in/" } ]
}
```

**Notes:**
- `casesDir` is optional; default is `tests/cases`.
- Throws if the YAML file cannot be found or parsed.

---

## browser-action

**When to use:** Once per step, in order.

**Input:**
```json
{
  "action": { "type": "click", "selector": "#submit", "timeout": 30000 },
  "context": { "page": "<Playwright Page>" }
}
```

**Output:**
```json
{ "status": "pass", "detail": "Clicked \"#submit\"", "context": { ... } }
```

**Supported action types:**

| Type         | Required fields       | Optional fields            |
|--------------|-----------------------|----------------------------|
| `navigate`   | `url`                 | `timeout`                  |
| `click`      | `selector`            | `timeout`                  |
| `fill`       | `selector`, `value`   | `timeout`                  |
| `select`     | `selector`, `value`   | `timeout`                  |
| `hover`      | `selector`            | `timeout`                  |
| `screenshot` | –                     | `screenshotPath`           |
| `wait`       | `selector` OR `value` | `timeout`                  |

---

## assert

**When to use:** After each step that has associated assertions.

**Input:**
```json
{
  "assertion": { "type": "url-contains", "expected": "/success/" },
  "context": { "page": "<Playwright Page>" }
}
```

**Output:**
```json
{ "passed": true, "actual": "https://example.com/success/", "expected": "/success/", "message": "..." }
```

**Supported assertion types:**

| Type               | Required fields            |
|--------------------|----------------------------|
| `url-contains`     | `expected`                 |
| `title-equals`     | `expected`                 |
| `element-visible`  | `selector`                 |
| `element-text`     | `selector`, `expected`     |
| `element-count`    | `selector`, `count`        |
| `attribute-equals` | `selector`, `attribute`, `expected` |

---

## log-recorder

**When to use:** After every skill invocation to record the outcome.

**Input:**
```json
{
  "event": "browser-action:click",
  "status": "pass",
  "detail": "Clicked #submit",
  "logStore": []
}
```

**Output:**
```json
{ "logEntry": { "event": "...", "status": "pass", "timestamp": "2025-01-01T00:00:00.000Z" } }
```

**Notes:**
- `logStore` is a shared array reference. Pass the same array instance for all
  calls in a single test run.
- `status` must be one of: `pass`, `fail`, `skip`, `info`.

---

## report-generator

**When to use:** Once, after `after-test` hook completes.

**Input:**
```json
{
  "testName": "login",
  "metadata": { "name": "login", "description": "..." },
  "logs": [ ... ],
  "outputDir": "reports"
}
```

**Output:**
```json
{
  "jsonPath": "reports/login-2025-01-01T00-00-00-000Z.json",
  "htmlPath": "reports/login-2025-01-01T00-00-00-000Z.html",
  "summary": { "total": 5, "passed": 4, "failed": 1, "skipped": 0, "duration": 3210 }
}
```
