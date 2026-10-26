---
name: speckit-quick
description: Make a contained change that follows an established project pattern, with focused tests and honest validation.
compatibility: Requires repository access and the relevant test or validation tools.
---

## User Input

```text
$ARGUMENTS
```

## Purpose

Entry: `/speckit.quick Q### [Q### ...]`.

Continue a resolved Quick handoff through **Understand → Implement → Validate**. Quick is appropriate when the intended outcome and material boundaries are understood and additional Feature stages are unlikely to materially improve the definition. It does not replace feature planning or decide broader unresolved product behavior.

## Workflow

1. Accept one or more exact Q IDs in one invocation and resolve every Q ID to its unique record under `specs/.scope/` before starting that item. If an ID is missing, duplicated, or ambiguous, ask rather than guessing; do not begin the affected item. Preserve each selected item's stated outcome and boundary separately.
2. Before editing, inspect relevant code and trace callers or consumers, established patterns, relevant tests, data/state/authorization behavior, and regression boundaries for each selected item. Identify a focused validation target. Graphify is optional navigation evidence when available and useful; verify material conclusions against authoritative source and continue source investigation if Graphify is unavailable or unhelpful.
3. If one consequential decision is bounded and does not require broader outcome definition, explain the choice and wait for the user's clear answer. Silence, an ambiguous answer, or a resumed interaction without the answer remains unresolved; do not cross that boundary. Continue only within the answered boundary.
4. If an item's outcome or boundary no longer fits its handoff, or safe implementation requires broader unresolved product, architecture, persistence, permission, migration, security, or cross-cutting decisions, preserve useful evidence and stop that item. Name the unresolved decision and recommend Scope or the appropriate owning workflow. Pause dependent items; continue unrelated items only when safe. Do not silently expand any item.
5. Determine dependencies before implementation. Sequence dependent items; parallelize only independent work when existing BSK rules permit. Keep delegated work within assigned item boundaries and retain parent ownership of scope and integrated validation.
6. Implement the smallest correct change that reuses the project’s existing abstractions. Avoid unrelated cleanup, new dependencies, or speculative generalization.
7. Add or update relevant tests when behavior changes. Run appropriate item-level checks and perform parent-owned integrated validation across a grouped execution. Review-quality inspection may be folded into this step when it materially improves confidence. It creates no Feature Review artifact and does not require Converge. Do not add a mandatory review stage solely because implementation is broad or batched. Report commands and outcomes truthfully; never claim a check or downstream skill ran when it did not.
   When runtime verification materially helps, use a lightweight runtime check at the changed behavior's execution boundary. QUICK does not mean skipping useful execution evidence, and a runtime check does not escalate the work into Feature ceremony. Reuse existing project/host capabilities; do not create browser or runtime infrastructure for irrelevant behavior.
8. Summarize the exact items completed, changes, item-level and integrated validation evidence, any review performed, and remaining risks or escalations.

## Escalation

Stop when safe implementation depends on broader unresolved product behavior, architecture, persistence, permission, migration, security, or cross-cutting decisions that need an owner. These implications alone do not require escalation when the outcome and boundaries are established. Record what the investigation established and the smallest decision needed next. Recommend re-scoping or the owning full workflow; do not create feature artifacts or decide on the user's behalf.

## Completion

Report the result and evidence concisely. If validation fails, state the failure and leave the work clearly incomplete. If no suitable validation could run, say so and identify the residual risk.
