---
name: "speckit-summary"
description: "Create a concise, evidence-grounded account of feature progress and delivered behavior at any workflow stage."
compatibility: "Requires a Spec Kit feature and access to its implementation and Review evidence."
---

## User Input

```text
$ARGUMENTS
```

Consider the user's requested feature or focus, but do not let it override the feature requirements, project constitution, approved design, or available evidence.

## Purpose

Create or update one feature-local `summary.md` that gives a fresh reader a concise as-of account of delivered reality at any workflow stage. Summary is descriptive, not another acceptance gate or source of requirements.

## Resolve the Feature

1. Use an explicitly supplied feature directory or the project's active feature context and existing Spec Kit resolution mechanism.
2. If no unique feature can be identified, ask for the feature path or context. Do not guess by title, recency, or branch name.
3. Read the feature's `spec.md`, `review.md`, and available implementation and verification evidence. Read the Brief, applicable `design.md`, `plan.md`, `tasks.md`, `analysis.md`, Converge evidence, related tests, and current repository state when available and useful.

## Review Gate

Summary is available at any workflow stage. A current, unambiguous Review `PASS` is required only for final completion or acceptance claims, not for a descriptive as-of account.

- If Review is missing, incomplete, ambiguous, stale, or not `PASS`, continue producing a descriptive Summary and report the current Review status and any uncertainty. Do not make final completion or acceptance claims.
- If Review reports an open blocking finding, or its PASS conflicts with its finding status, describe the current state without claiming completion. Preserve Review's finding IDs and ownership; do not copy or change its findings.
- Inspect repository state for implementation changes that may postdate or invalidate Review. If current acceptance cannot be established, report that uncertainty instead of treating an old PASS as current; this does not prevent descriptive as-of reporting.
- Do not invoke Review, resolve findings, or claim another workflow command ran.

## Evidence Rules

- Inspect the delivered implementation and available completion evidence; prefer evidence of delivered behavior over planned work.
- Treat the Brief and specification as intent, Plan and Tasks as intended work, Review as authority for final acceptance, and current source/tests as evidence of what exists. Do not infer implementation from a checked task or a planned artifact.
- State a test, acceptance check, Converge result, or other verification only when current evidence shows that it ran and what result it produced.
- If evidence conflicts or is unavailable, report uncertainty. Never invent behavior, rationale, test results, or completion status.
- Report the current workflow stage and Review status so readers can distinguish an as-of account from a final completion handoff.
- Summary is descriptive historical context, not an authority over current source code, tests, Review, later work, or earlier authoritative artifacts.

## Write `summary.md`

Write only `summary.md` in the selected feature directory. Keep it concise, plain-English-first, standalone for a fresh session, and proportionate to the feature. Include only material information, using relevant sections such as:

- **Why we did this**: the original problem or intended outcome.
- **What was delivered**: the behavior and capabilities that exist now.
- **Important behavior and decisions**: material decisions, semantics, and why the feature works this way, with references to authoritative artifacts where useful.
- **Implementation overview**: when material, provide a concise implementation overview explaining how the delivered capability fits into the existing application. Prefer architectural meaning over file lists.
- **What deliberately did not change**: important boundaries future work could otherwise misunderstand.
- **Deviations, limitations, and verification**: include only material deviations with evidenced reasons, remaining limitations, and verification that actually occurred.
- **Current state and authority**: note relevant current state and that Summary is descriptive, not authoritative.

Omit empty or immaterial sections. Do not produce exhaustive file lists, task-by-task narration, transcripts, raw commit summaries, duplicated Review findings, marketing language, or a rewritten specification. Technical detail belongs only when it materially helps a reader understand how the application now works or what future work needs to know.

## Final Check and Handoff

Before writing, verify the selected feature, current workflow and Review status, and each factual claim against available evidence. Ensure the artifact describes delivered reality, preserves ownership, and makes no unsupported completion or verification claim. Review PASS is required only before using final completion or acceptance language.

After writing, report the `summary.md` path, the Review evidence used, material evidence limitations, and any validation actually inspected. Do not claim the feature is complete beyond what Review and current evidence establish.
