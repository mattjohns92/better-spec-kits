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

Entry: `/speckit.quick Q###`.

Continue one resolved Quick handoff through **Understand → Implement → Validate**. Quick is for contained changes that fit an established pattern; it does not replace feature planning or make material product and architecture decisions.

## Workflow

1. Resolve the exact `Q###` record under `specs/.scope/`. If the ID is missing, duplicated, or ambiguous, ask rather than guessing. Preserve its stated outcome and boundaries.
2. Inspect the relevant code, callers, neighboring tests, and established patterns before editing. Confirm the requested outcome and identify a focused check that can falsify the implementation hypothesis.
3. If the work no longer fits its recorded boundary, preserve the useful evidence and stop. Recommend Scope or the appropriate full workflow rather than silently expanding the task.
4. Implement the smallest correct change that reuses the project’s existing abstractions. Avoid unrelated cleanup, new dependencies, or speculative generalization.
5. Add or update relevant tests when behavior changes. Run the narrowest useful validation first, then any required project gate. Report commands and outcomes truthfully; never claim a check or downstream skill ran when it did not.
6. Summarize the changed behavior, relevant files, validation evidence, and any remaining risk or blocker.

## Escalation

Stop when safe implementation depends on unresolved product behavior, architecture, persistence, permission, migration, security, or cross-cutting decisions. Record what the investigation established and the smallest decision needed next. Recommend re-scoping or the owning full workflow; do not create feature artifacts or decide on the user's behalf.

## Completion

Report the result and evidence concisely. If validation fails, state the failure and leave the work clearly incomplete. If no suitable validation could run, say so and identify the residual risk.
