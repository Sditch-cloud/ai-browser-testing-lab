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

## resolve-locator

**When to use:** Before `browser-action` or `assert` when a step/assertion omits `selector` and relies on semantic or natural-language targeting.

**Input:**
```json
{
  "descriptor": { "type": "fill", "target": "username field", "description": "Enter username" },
  "context": { "page": "<Playwright Page>" }
}
```

**Output:**
```json
{
  "locator": { "testId": "login-username" },
  "strategy": "inferred:testId",
  "detail": "Resolved test id \"login-username\" from target \"username field\""
}
```

**Notes:**
- Explicit locator fields win over inference.
- DOM-based inference works best when the app exposes stable `data-testid` values.
- `browser-action` and `assert` can also auto-resolve locators internally when given the same descriptor.

---

## browser-action

**When to use:** Once per step, in order.

**Input:**
```json
{
  "action": { "type": "click", "testId": "login-submit", "timeout": 30000 },
  "context": { "page": "<Playwright Page>" }
}
```

**Output:**
```json
{ "status": "pass", "detail": "Clicked test id \"login-submit\"", "context": { ... } }
```

**Supported action types:**

| Type         | Required fields            | Optional fields  |
|--------------|----------------------------|------------------|
| `navigate`   | `url`                      | `timeout`        |
| `click`      | locator info               | `timeout`        |
| `fill`       | locator info, `value`      | `timeout`        |
| `select`     | locator info, `value`      | `timeout`        |
| `hover`      | locator info               | `timeout`        |
| `screenshot` | -                          | `screenshotPath` |
| `wait`       | locator info OR `value`    | `timeout`        |

Locator info can be provided via `selector`, `testId`, `label`, `role` + `name`, `text`, `placeholder`, a structured `locator` object, or a natural-language `target`.

---

## assert

**When to use:** After each step that has associated assertions.

**Input:**
```json
{
  "assertion": { "type": "element-visible", "testId": "welcome-message" },
  "context": { "page": "<Playwright Page>" }
}
```

**Output:**
```json
{ "passed": true, "actual": "true", "expected": "true", "message": "..." }
```

**Supported assertion types:**

| Type               | Required fields                     |
|--------------------|-------------------------------------|
| `url-contains`     | `expected`                          |
| `title-equals`     | `expected`                          |
| `element-visible`  | locator info                        |
| `element-text`     | locator info, `expected`            |
| `element-count`    | locator info, `count`               |
| `attribute-equals` | locator info, `attribute`, `expected` |

---

## log-recorder

**When to use:** After every skill invocation to record the outcome.

**Input:**
```json
{
  "event": "browser-action:click",
  "status": "pass",
  "detail": "Clicked test id login-submit",
  "logStore": []
}
```

**Output:**
```json
{ "logEntry": { "event": "...", "status": "pass", "timestamp": "2025-01-01T00:00:00.000Z" } }
```

**Notes:**
- `logStore` is a shared array reference. Pass the same array instance for all calls in a single test run.
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
