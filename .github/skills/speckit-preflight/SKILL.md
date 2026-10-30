---
name: speckit-preflight
description: Read-only readiness, current-source, and surface-compatibility check for one exact work item.
compatibility: Requires repository access and the Better Spec Kit source-ownership helper for reservation preview.
metadata:
  author: better-spec-kit
---

# Preflight

Use `/speckit-preflight <exact-work-item>` to inspect one Feature, QUICK, or assessed BUG before deciding whether to enter implementation. Preflight is an advisory read-only snapshot. It never admits work, reserves a surface, changes a registry, or edits a work-item artifact.

## Resolve One Exact Item

Use the explicit argument first; otherwise continue only one unambiguous item already selected in the current conversation. Never choose by title, recency, directory order, branch, repository membership, or `.specify/feature.json`.

- **Feature**: Accept an exact `F###`. Resolve exactly one normal numbered `specs/` Feature Brief, verify its front-matter `id`, and use its exact `feature_directory`. Verify the Brief path and recorded directory agree.
- **QUICK**: Accept an exact `Q###`. Resolve exactly one new Brief under `specs/quick/` or one legacy handoff under `specs/.scope/`; reject missing, duplicate, or conflicting records. Associate supplemental artifacts only by exact Q ID and slug.
- **BUG**: Accept an exact `.specify/bugs/<slug>` path or `slug=<slug>` only when that directory has an upstream `assessment.md`. A bare slug may be used only when it resolves to exactly one existing assessment directory. Do not map a Scope `B###` handoff to a Bug assessment or guess a slug. Bug Assess/Fix/Test remain upstream-owned.

If the identity is missing, unsupported, duplicated, or inconsistent, report `UNKNOWN`, explain the exact ambiguity, and ask for the minimum clarification. Do not inspect uncertain item artifacts or start a downstream workflow.

## Establish Readiness

Read only the selected item's authoritative artifacts and the minimum relevant shared evidence. Readiness is derived, never persisted.

- **Feature**: Verify the exact Brief, completed applicable preparation, required current approved Design, Plan, Tasks, and a current Analyze `PASS` with no OPEN blocking findings. Confirm Analyze still applies to the current relevant artifacts. Preview is optional unless separately requested.
- **QUICK**: Verify the exact Brief/handoff and resolved applicable decisions. A UI Quick additionally requires explicit approval of its current Design. Do not require Feature-only Spec, Plan, Tasks, or Analyze for non-visual Quick work.
- **BUG**: Verify the exact upstream `assessment.md` and report its verdict, severity, and any unresolved `[NEEDS CLARIFICATION]` entries relevant to fixing. An `invalid` assessment is blocked; unresolved material clarification is `NEEDS DECISION`. Do not create or alter Bug artifacts or claim the upstream Fix command ran.

Report readiness separately from surface compatibility. Use `READY TO IMPLEMENT` only when applicable preparation and decisions are evidenced. Missing or contradictory evidence is `UNKNOWN`; an unmet gate is `BLOCKED`; a consequential unresolved choice is `NEEDS DECISION`.

## Check Current Source

Inspect the current source in material areas referenced by the selected item's authoritative assumptions and planned changes:

- Feature: material Plan/Tasks assumptions and relevant Spec/Design decisions.
- QUICK: material Brief/approved Design assumptions and the inspected implementation/test targets.
- BUG: suspected paths, root-cause hypothesis, proposed remediation, and listed files/tests in the upstream assessment.

Compare behavior, contracts, structure, and relevant implementation state. Git status/history may help locate relevant changes, including in nested repositories, but is supplemental. A file changing alone, elapsed time, or a stale graph is not evidence that an assumption is invalid. If the current source still satisfies the assumptions, report them `VALID`; do not run full Analyze merely for reassurance.

If evidence materially invalidates an assumption, report `STALE` with the affected assumption, concise current-source evidence, and the earliest authoritative stage that can reconsider it. Route Feature changes through existing Analyze/Remediate; route Quick decisions to their existing owner; route an incorrect Bug assessment back to upstream Bug Assess. Preserve unaffected decisions. Do not modify Spec, Design, Plan, Tasks, Briefs, or Bug artifacts.

## Derive the Complete Surface

Build one complete expected shared-source surface from authoritative evidence:

- Feature: all source-changing task targets and accepted source-changing remediation.
- QUICK: all inspected implementation and test targets for that exact Q item.
- BUG: all `Files likely to change` and `Tests to add or update` targets in the exact assessment.

Include every concrete file/path and explicitly named shared runtime/resource target that may change. Exclude item-local planning/report artifacts unless they are themselves shared mutable resources. Use workspace-relative paths and exact canonical resource IDs. Include an exact new-file path when authoritative work explicitly requires creating that file; otherwise a missing, ambiguous, wildcarded, unsafe, or unbounded target makes the surface `UNKNOWN`. Do not guess missing targets or submit a partial surface.

## Preview Compatibility

When readiness and the complete surface are established, run the helper's read-only `preview` operation from the repository root with exactly one identity option and every path/resource. Use `node .github/hooks/speckit-source-ownership.mjs` and the matching option:

- Feature: `preview --feature-dir <exact-feature-directory>`
- QUICK: `preview --quick-id <exact-Q###>`
- BUG: `preview --bug-dir .specify/bugs/<exact-slug>`

Repeat `--path <workspace-relative-path>` and `--resource <canonical-id>` for the complete surface. Do not infer identity or omit targets to obtain a clear result.

Interpret helper results as follows:

- `CLEAR AT INSPECTION`: no known current overlap at the time of this read-only snapshot.
- `CONFLICT`: report `BLOCKED`, naming the overlapping reservation and exact path/resource.
- `BLOCKED`: a fresh entry for this exact item is already reserved; do not imply that this inspection renewed or owns it.
- `UNKNOWN`: report the reason and do not claim compatibility.

The preview may become stale immediately. Do not call `claim`, `revise`, `release`, or `recover` from standalone Preflight. Do not write an outcome, reservation, cache, or report file.

## Automatic Consumers

Implement, Quick, and upstream Bug Fix use this same procedure automatically immediately before source-changing admission; users do not need to invoke the standalone command first. Auto delegates to its authoritative implementation stage. The automatic consumer must repeat readiness, current-source, and complete-surface checks for the current attempt, then its owning implementation workflow calls one atomic `claim` with the same exact identity and complete surface. A prior manual or automatic `CLEAR AT INSPECTION` is never reused as admission evidence. Only a successful atomic `claim` means `ADMITTED TO IMPLEMENT`.

If automatic Preflight is `STALE`, `BLOCKED`, `NEEDS DECISION`, or `UNKNOWN`, stop the whole item before source changes and follow the relevant existing owner. A cleared conflict requires a fresh explicit attempt. After successful claim, continue within the reserved surface without per-edit ownership checks; a material expansion requires the existing atomic full-surface `revise` before touching the expanded area.

## Report

Return a concise chat report with the exact item, readiness, current-source result, preview result and evidence, complete surface size, and next authoritative action. For a clear standalone inspection, state exactly:

```text
Preflight: CLEAR AT INSPECTION
Readiness: READY TO IMPLEMENT
Current-source assumptions: VALID
Surface compatibility: CLEAR AT INSPECTION
Admission: NOT CLAIMED
```

For all other outcomes, name the precise blocker, stale assumption, decision, or unknown evidence. Never call a clear result `ADMITTED`, imply a future claim will succeed, or claim downstream stages ran unless they actually ran.