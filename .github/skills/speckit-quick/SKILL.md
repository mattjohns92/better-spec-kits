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

1. Accept one or more exact Q IDs in one invocation and resolve every Q ID to its unique record, exactly one Brief record per Q ID: either a new Q Brief at `specs/quick/Q###-<slug>/brief.md` or one existing legacy Q handoff at `specs/.scope/Q###-<slug>.md`. If an ID is missing or has duplicate or conflicting matches across either location, ask rather than guessing; do not begin the affected item. Preserve each selected item's stated outcome and boundary separately, along with established Scope evidence. New Q work has one authoritative Brief and no duplicate `.scope` handoff; legacy handoffs remain readable and are not migrated.
2. Before editing, read the selected Brief/handoff and inspect relevant code and trace callers or consumers, established patterns, relevant tests, data/state/authorization behavior, and regression boundaries for each item. Consume authoritative Scope evidence before repeating investigation; verify only material current behavior or facts the upstream record does not establish. Identify a focused validation target. Graphify is optional navigation evidence when available and useful; verify material conclusions against authoritative source and continue source investigation if Graphify is unavailable or unhelpful.
3. If one consequential decision is bounded and does not require broader outcome definition, explain the choice and wait for the user's clear answer. Silence, an ambiguous answer, or a resumed interaction without the answer remains unresolved; do not cross that boundary. Continue only within the answered boundary.
4. If an item's outcome or boundary no longer fits its handoff, or safe implementation requires broader unresolved product, architecture, persistence, permission, migration, security, or cross-cutting decisions, preserve useful evidence and stop that item. For a Q item, preserve the Brief, approved Design, concepts, and investigation evidence when escalating. Name the unresolved decision and recommend Scope or the appropriate owning workflow. Pause dependent items; continue unrelated items only when safe. Do not silently expand any item.
5. Determine dependencies before implementation. Sequence dependent items; parallelize only independent work when existing BSK rules permit. Keep delegated work within assigned item boundaries and retain parent ownership of scope and integrated validation. Each Q item retains its own Brief, applicable Design, and Review outcome. If one item escalates, escalate only the affected Q item and continue unrelated independent items when safe. Do not create a batch record.
6. Implement the smallest correct change that reuses the project’s existing abstractions. Avoid unrelated cleanup, new dependencies, or speculative generalization.
   For a Q Brief with `design.md`, read the authoritative Brief and current approved `design.md` directly before editing. Inspect the approved concept and rendered reference where available; rejected or superseded concepts are never implementation targets. Reuse components only when they faithfully implement the approved Design. If a material implementation constraint requires changing the approved Design, stop dependent implementation, preserve the evidence, and return to Design for explicit user approval; do not silently redesign.
7. Add or update relevant tests when behavior changes. Run appropriate item-level checks and perform parent-owned integrated validation when changed items interact. Associate any shared integration evidence with each affected Q item's Review; do not create a batch record. Validation is required before every Quick item goes through the existing independent Review; do not treat implementation claims or Quick's own inspection as Review evidence. Review writes its existing `review.md` artifact in the new or matching supplemental Q folder and owns the outcome and findings. Quick Review does not require Feature Converge, Summary, or a Q task ledger. Report commands and outcomes truthfully; never claim a check or downstream skill ran when it did not.
   Before Quick work on an item with Q-local `review.md`, read it and preserve every finding's stable ID and status. Automatically address OPEN `BLOCKER` and `HIGH` findings; address `MEDIUM` or `LOW` only when the user explicitly requests them or an existing mandatory constraint applies. Do not modify `review.md` or change finding status. Only a subsequent Review reassessment may change status to `RESOLVED`. After remediation, rerun the relevant validation and return the item to Review. Never create a Q task ledger or copy findings into another artifact.
   Validation is required before Review and is selected from changed behavior, risk, available project/host capability, and safety. When runtime verification materially helps, use a lightweight runtime check at the changed behavior's execution boundary. QUICK does not mean skipping useful execution evidence, and a runtime check does not escalate the work into Feature ceremony. Reuse existing project/host capabilities; do not create browser or runtime infrastructure for irrelevant behavior.
   For frontend Quick work, exercise the running interaction and compare it with the approved Design when a safe running application and callable browser/runtime make that practical. If runtime/browser execution is unavailable or unsafe, report the limitation and affected behavior; do not claim it passed. Browser verification must not be required for non-browser behavior. Planned checks and source inspection are not runtime evidence.
   For authenticated checks, inspect existing project/browser mechanisms first. BSK may explain the needed non-production identity/role and guide the user through providing or creating one, but must not itself create or provision an external identity. Obtain approval before setup changes, credential-dependent steps, or state capture. If automated authentication is unsuitable, manual login followed by locally persisted browser state is allowed only with callable safe capture/reuse and verified version-control exclusion; otherwise report the behavior unverified.
8. Summarize the exact items completed, changes, item-level and integrated validation evidence, any review performed, and remaining risks or escalations.

## Escalation

Stop when safe implementation depends on broader unresolved product behavior, architecture, persistence, permission, migration, security, or cross-cutting decisions that need an owner. These implications alone do not require escalation when the outcome and boundaries are established. Record what the investigation established and the smallest decision needed next. Recommend re-scoping or the owning full workflow; do not create feature artifacts or decide on the user's behalf.

## Completion

Report the result and evidence concisely. If validation fails, state the failure and leave the work clearly incomplete. If no suitable validation could run, say so and identify the residual risk.
