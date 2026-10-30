---
name: speckit-release
description: Release one exact work item's shared-source reservation at a stable implementation boundary.
compatibility: Requires a Better Spec Kit repository with the source-ownership helper installed.
---

## User Input

```text
$ARGUMENTS
```

## Workflow

1. Resolve exactly one Feature, QUICK, or BUG from the explicit input or unambiguous current conversation. For a Feature, resolve its unique Scope Brief and exact `feature_directory`. For a QUICK, use its exact Q ID and unique authoritative record. For a BUG, use its exact `.specify/bugs/<slug>` directory and existing upstream assessment. If identity is missing, duplicated, or inconsistent, ask for the exact item; never infer it from repository state.
2. Release is allowed only at a stable implementation boundary: no source edits are active and no validation or decision requires the surface to remain stable. It does not mean the work item is complete. If the boundary is not established, do not release; explain the unresolved source work or stability need.
3. Before invoking release, give one concise warning that overlapping work may proceed and later remediation may wait. The explicit `/speckit-release` request is the user's action; do not start an approval loop.
4. Run exactly one matching operation from the repository root:
   - Feature: `node .github/hooks/speckit-source-ownership.mjs release --feature-dir <feature_directory>`
   - QUICK: `node .github/hooks/speckit-source-ownership.mjs release --quick-id <Q###>`
   - BUG: `node .github/hooks/speckit-source-ownership.mjs release --bug-dir .specify/bugs/<slug>`
5. Report the helper result truthfully. The operation changes only the exact matching registry reservation. Do not edit or imply changes to status, Tasks, Review findings, validation, Summary, or item completion. Do not release any other reservation.

## Boundaries

- Do not release while source work is active or while validation needs a stable implementation surface.
- Do not run `claim`, `recover`, or another item's release as part of this workflow.
- Do not treat elapsed time, closed sessions, Review outcome, or overall work-item completion as proof of a stable boundary.
- If the registry is unknown, malformed, or otherwise refuses release, report the limitation and stop. Never remove locks or overwrite reservations.
