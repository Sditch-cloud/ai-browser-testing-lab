# Test Orchestration Rules

## Status

This document is intentionally minimal for now.
Detailed orchestration rules are reserved for later implementation.

## Current Rule

- AI must execute tests only through the public tool wrapper under `tools/runner/`.
- The public tool wrapper must invoke `runner/cli.js`.
- AI must not rely on internal implementation files under `runner/`.

## Reserved (TBD)

- Hook lifecycle rules
- Step and assertion orchestration details
- Failure/continue policy details
- Environment reachability policy details
- State threading contract details
