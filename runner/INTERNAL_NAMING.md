# Runner Internal Naming Conventions

This file defines naming and export conventions inside the runner implementation.

## Scope

Applies to internal modules under `runner/` including `execution/`, `runtime/`, `lifecycle/`, `_services/`, and `_lib/`.

## File Naming

- Use `kebab-case` for file and directory names.
- Use semantic role names in paths.
  - Examples: `runtime/parse-test-case.js`, `execution/run-step.js`, `lifecycle/on-error.js`.

## Symbol Naming

- Use `camelCase` for function and variable names.
- Prefer intention-revealing verbs for entry functions.
  - Examples: `createRunnerDependencies`, `executeStepAction`, `executeAssertion`, `runAssertions`.

## Export Conventions

- Prefer explicit imports in index files, then export object shorthand.
- Keep registry keys stable where they are part of descriptor contracts.
  - Example: assertion registry keys stay as `element-visible`, `url-contains`.

## Boundary Conventions

- Modules above low-level tools should import from `runner/tools/index.js`, not directly from `runner/_lib/*`.
- Lifecycle hooks should be imported from `runner/lifecycle/*`.
- Public AI-facing calls must still go through `tools/runner/`.

## Comments

- Add comments for major entry methods to explain responsibilities, inputs/outputs, and abort behavior.
- Avoid line-by-line explanatory comments for obvious code.