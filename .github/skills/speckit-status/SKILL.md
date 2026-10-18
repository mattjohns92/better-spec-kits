---
name: speckit-status
description: Report a Better Spec Kit project's work, evidence-backed lifecycle state, blockers, and next actions.
compatibility: Requires repository access to inspect Better Spec Kit feature and Scope artifacts.
---

## User Input

```text
$ARGUMENTS
```

Consider any requested focus, but keep project-level reporting as the default and never let a target override artifact ownership or the evidence rules below.

## Purpose

`/speckit.status` provides a concise, read-only project-level overview of Better Spec Kit work in the current project. It answers what work exists, what needs attention, what can be considered complete, what evidence supports those conclusions, and what should happen next.

Project Status reports state; it does not own state. Existing project artifacts remain authoritative.

## Resolve the View

- With no target, `/speckit.status` reports the project-level overview without requiring a feature or Initiative ID. Do not select an assumed active feature.
- If an exact feature or Initiative ID or explicit feature directory is supplied, provide a focused view only when it resolves uniquely using the repository's recorded identity and path conventions.
- Never resolve by title, recency, partial ID, branch name, or directory order. If the requested target is missing, duplicated, or ambiguous, state the ambiguity and ask for the minimum information needed.
- A focused view is optional. It must follow the same evidence and reporting rules as project status.

## Discover Work Progressively

1. Inspect standard numbered feature directories such as `specs/NNN-<slug>/` and relevant Scope records under `specs/.scope/`.
2. Read Initiative child maps and include planned child features even when no feature directory exists yet.
3. Include legacy directories when they contain relevant Better Spec Kit artifacts, even if they lack a Scope Feature Brief or use older artifact conventions. State classification limits rather than requiring migration.
4. Associate records only when exact IDs and recorded paths support the relationship. Report duplicate IDs and path conflicts; do not guess or silently merge them.
5. After finding work, inspect only the relevant status-bearing artifacts needed to classify each item and support a blocker, conflict, or recommendation. Expand further only when evidence is ambiguous or contradictory.
6. Do not scan arbitrary implementation files for TODO comments. Treat unfinished work as a feature blocker only when an established feature artifact ties it to the current completion requirements.

If repository access fails, report that inspection limitation. Do not describe an inaccessible project as empty.

## Interpret Evidence Without Inventing Completion

Use artifact contents, explicit outcomes, ownership, and applicability to the current feature. File existence, file order, checked Tasks, source changes, test claims, and Summary wording do not independently prove success.

### Scope, Initiative, and Planning

- A Feature Brief or Scope handoff proves scoped intent, not specification, implementation, or completion.
- A Spec records specified intent. Applicable Design, Plan, and Tasks show workflow planning, not delivered or accepted behavior.
- Design and Preview are optional where the feature's workflow does not use them; their absence alone is not a failure or blocker.
- Initiative records own their existing decomposition and parent-map status. Use child artifacts for the child's detailed evidence; report parent/child conflicts without changing either source.
- Do not assume an old directory is abandoned or superseded based on age or inactivity. Report those states only when existing authoritative records explicitly establish them.

### Analyze

- Read the explicit outcome and current finding statuses in `analysis.md`.
- `PASS` is Analyze evidence only. `FINDINGS` with OPEN blocking findings requires the established Analyze remediation route; do not recommend Preview or implementation instead.
- `INCOMPLETE ANALYSIS`, missing or malformed outcomes, and inaccessible evidence are not PASS. Report the limitation and the smallest useful evidence-recovery action.
- Analyze owns its findings. Report their IDs/status as written; do not resolve or reinterpret them.

### Tasks and Implementation

- Use T### tasks, Implement-owned remediation tasks such as R###, and other established completion work as progress evidence.
- Checked tasks do not prove Review PASS or completion. Unchecked tasks do not automatically prove remaining work when current evidence establishes otherwise; however, do not dismiss an explicitly required acceptance item without evidence.
- When implementation has not begun and its required pre-implementation checks are satisfied, report ready to implement. When work is partial, report it as in progress.
- When implementation appears complete but required validation is not established, report validation pending and recommend the applicable next validation stage.

### Required and Deferred Work

- Label current completion blockers only where an authoritative artifact says they are required for the feature's current completion or a blocking workflow decision.
- Explicitly deferred future work is not a current blocker. Report it separately only when useful to understand the feature's state.
- An unchecked task or TODO is not automatically required work. Do not scan arbitrary implementation files for TODO comments; use them only when an established feature artifact ties them to current completion requirements.

### Converge

- GitHub Spec Kit owns Converge. Do not create a replacement, infer a successful result from task checkboxes, or assume a universal result filename exists.
- Use Converge evidence only when it applies to this feature and current implementation. If applicability or freshness cannot be established, disclose that limitation.
- When Converge identifies outstanding work, report it and recommend completing that work before rerunning Converge and proceeding to Review.

### Review, Summary, and Acceptance

- Review owns post-implementation findings and outcome. An existing `review.md` is not proof of PASS.
- OPEN blocking Review findings prevent a COMPLETE claim. Recommend the established Review-remediation path without changing finding IDs, statuses, or evidence.
- `INCOMPLETE REVIEW`, missing/malformed outcomes, stale evidence, or unclear applicability are not PASS.
- Summary is a descriptive as-of account. Its existence or completion wording does not prove Review PASS, acceptance, or completion.
- Report COMPLETE only when current, unambiguous Review PASS and a consistent final completion handoff support it, and all acceptance that the feature explicitly makes mandatory is evidenced as passed and current. Do not require runtime acceptance when the feature establishes no such requirement.
- If required manual or supported-agent acceptance is pending, failed, missing, or unverifiable, state that limitation and recommend the acceptance action. Deterministic test results do not prove an external runtime scenario passed.

## Recommend, Do Not Execute

Give the most useful next action based on current evidence and the workflow owner. Do not choose an action merely because a filename is absent or a stage appears next in a conceptual sequence.

- If Analyze has OPEN blocking findings, recommend the existing remediation route and a later fresh Analyze run.
- If Analyze PASS is current and implementation is not evidenced, recommend implementation.
- If implementation is incomplete, recommend the appropriate implementation continuation or Converge action based on the evidence.
- If Review has OPEN blocking findings, recommend the established Review remediation workflow.
- If required acceptance or a final completion handoff remains, recommend that specific action rather than an unrelated missing artifact.
- Recommend a slash-command spelling only when the active integration exposes or otherwise verifies that alias. Examples written in artifacts are not proof that the host supports them. If the alias is not established, name the workflow stage and describe the manual action without inventing a command.
- Recommendations are informational. Status must not execute the recommended workflow. Never invoke another skill, run implementation, modify a file, check off a task, resolve a finding, or alter lifecycle state.

## Initiative and Project Summary

The existing `better-spec-kit status` command reports installation and integration diagnostics; it is separate from this project lifecycle report and must remain unchanged.

Use the Initiative's existing objective, child map, dependencies, and recommended starting feature where present. Report a completion count or next child only when the mapped child set and its evidence support that conclusion. Do not create a new dependency plan, schedule, assignments, estimates, roadmap, or initiative state.

Use `PROJECT STATUS` as the report title. Keep the overview proportionate and organize relevant work in this order:

1. **Needs Attention**: blockers, failed or pending required acceptance, contradictions, ambiguity, and material evidence gaps.
2. **In Progress / Ready**: active work and its immediate supported next action.
3. **Planned**: scoped and Initiative work that has not materially started.
4. **Initiatives**: concise parent progress and next child only where supported.
5. **Complete**: compact completed-work summary.

Omit empty sections. Each material entry should include the known ID/title, state, blocker or uncertainty when relevant, one recommended next action, and concise evidence references. Put attention and next actions before completed work. Keep completed work compact for large projects. Do not reproduce Specs, Plans, Tasks, Summaries, Review reports, or full Initiative maps. Use short Markdown lists rather than wide tables.

For an empty project, say that no relevant work was found and do not invent an action. For unknown or contradictory work, state what was found, what cannot be established, and the smallest useful next step. Use words for states; never rely on color, symbols, or emoji alone.

## Read-Only Invariant

Status reads existing project evidence and returns a report only. It does not create, modify, check off, resolve, repair, or delete project artifacts; it does not change implementation or create a status registry, cache, database, task ledger, or saved report. The user decides whether to follow a recommendation.
