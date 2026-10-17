---
name: "speckit-preview"
description: "Explain the current approved feature proposal in plain English before implementation."
compatibility: "Requires a Spec Kit feature directory and access to applicable feature artifacts."
---

## User Input

```text
$ARGUMENTS
```

## Purpose

Invoke `/speckit.preview` to create or replace a feature-local `implementation-preview.md` that explains what the current applicable artifacts propose to build. Preview is an independent, optional capability, not another analysis, planning, approval, or implementation stage.

## Select the Feature

1. Use an explicitly provided feature directory when supplied.
2. Otherwise use the existing Spec Kit active-feature context only when it identifies one feature unambiguously.
3. If no unique feature can be identified, ask for its directory or supported context. Do not guess from title, recency, or branch name.
4. Do not require `tasks.md` or another artifact that is not applicable to this feature's current workflow state.

## Read Current Evidence

Re-read the current applicable sources on every invocation before presenting or replacing a Preview. Read the Feature Brief or Scope intent, `spec.md`, recorded clarification outcomes, `design.md`, `plan.md`, `tasks.md`, `analysis.md`, and relevant repository/application context when they exist and help explain the proposal. Do not require every artifact when the workflow legitimately does not use it.

A saved Preview is not evidence that it remains current. Regenerate it from the current sources when invoked; do not add hashes, version tracking, dependency graphs, or cache invalidation.

When sources are missing, inaccessible, or materially contradictory, identify that limitation in plain language. Do not invent a decision or present unsupported details as approved. If the available evidence is insufficient to explain a proposed implementation responsibly, say so rather than manufacturing one.

## Explain the Proposal

Keep original intent distinct from the current proposed implementation. The Feature Brief explains what was originally wanted; later repetition alone does not change that intent. The applicable approved artifacts explain the current proposal. Current source and authoritative artifacts prevail if the Preview conflicts with them.

Explain the proposal in plain English, prioritizing outcomes over internal files or task identifiers. Where useful, cover:

- The original goal.
- What users or the application will be able to do.
- How existing behavior is extended, reused, replaced, or otherwise affected.
- Material decisions already established in authoritative artifacts.
- Significant supporting work that has been approved and why it is included, described neutrally.
- Important boundaries and what is not changing.
- The high-level implementation shape when it helps explain the proposal.

Use only sections that help this feature. Keep a small proposal short. A broader proposal may need more context, but must not become another Plan or an exhaustive changed-file forecast. Do not reproduce the tasks ledger. Do not assume supporting work is unwanted or unnecessary merely because it was not obvious in the original request.

Preview explains what the artifacts propose. It does not decide whether the proposal is justified, proportionate, or approved; Analyze owns that challenge. Do not invent or alter requirements, architecture, dependencies, implementation decisions, user stories, tasks, or acceptance findings. If an approved decision is surprising, explain it accurately rather than silently removing or redesigning it.

## Write the Derived Artifact

Write or replace only a separate feature-local `implementation-preview.md` in the selected feature directory. Identify it as a derived and non-authoritative explanation of the current proposal. It owns no requirements or decisions and does not replace the Brief, Spec, Design, Plan, Tasks, Analyze result, source code, or Summary.

It must not modify its source artifacts, implementation files, `analysis.md`, or `summary.md`. Do not create a Preview approval state or remediation workflow.

## Finish and Hand Off

Present the Preview in the conversation or link to its feature-local artifact. Keep the final response brief and explicit:

- If satisfied, run `/speckit.implement`.
- If a change is wanted, tell Better Spec Kit what should change.

If Analyze has not returned PASS or has open findings, do not imply Preview approved the work or overrides Analyze's existing progression rules. Preview remains useful when invoked manually and does not invoke Implement automatically.

Do not assume what the user dislikes. Do not offer a routing catalogue or a menu of hypothetical objections.
