---
name: speckit-remediate
description: Coordinate the minimum authoritative upstream remediation for blocking Analyze findings, then return control for independent analysis.
compatibility: Requires a Spec Kit feature with analysis.md and access to the installed authoritative stage skill instructions.
---

## User Input

```text
$ARGUMENTS
```

Consider any requested scope, but do not let it override the feature specification, constitution, approved design, project constraints, or Analyze ownership.

## Purpose

Invoke this workflow with `/speckit.remediate` to coordinate pre-implementation corrections identified by Analyze. It reads `analysis.md`, routes applicable findings through the existing authoritative stage behavior, reconciles only affected downstream artifacts, and returns control to the user for a fresh Analyze run.

Remediate is not a second implementation of Clarify, Design, Plan, or Tasks. It does not decide whether a finding is resolved.

## Operating Constraints

- Only Analyze owns `analysis.md` and its finding statuses. Do not create, edit, delete, renumber, resolve, or reprioritize any Analyze finding.
- Do not claim Analyze accepted remediation or that an OPEN finding is resolved.
- Do not automatically run Analyze, Implement, Converge, or Review.
- Do not create `remediation.md`, another findings ledger, a workflow engine, a dispatcher, persistent orchestration state, or new runtime services.
- Do not copy complete stage instructions into this skill. Do not claim to invoke a nested skill or command unless the host actually supports and performs that invocation.
- Keep the user's feature artifacts and existing task history intact except for targeted edits made by their authoritative stages.
- Follow existing stage rules and optional integration behavior; Remediate does not add separate specialist-tool requirements.

## Workflow

### 1. Resolve the feature and inspect evidence

Identify the active feature using the project's existing Spec Kit feature-resolution mechanism. Do not infer the feature directory from a branch name when project metadata or the existing prerequisite helper identifies it.

Read the active feature's `analysis.md` and the artifacts needed to assess current relevance and downstream impact. At minimum inspect the referenced spec, design when applicable, plan, and tasks. Read the constitution and relevant project conventions where available.

If `analysis.md` is missing or malformed, do not infer findings or edit it. Report the problem and recommend running Analyze to create a current, valid artifact.

Before acting, assess whether the relevant feature artifacts materially changed after the recorded Analyze run. Use practical existing evidence such as the analysis context, current artifact contents, and available history; do not add hashing or versioning infrastructure. Re-check whether each finding still applies. If it is stale or applicability cannot be established safely, do not apply obsolete remediation; report the evidence and recommend a fresh Analyze run.

### 2. Select applicable findings

Read each finding's stable ID, severity, status, `Blocking` value, remediation stage, evidence, resolution direction, and potential downstream impact.

- Consider only findings with `Status: OPEN`.
- By default, remediate `BLOCKER` and `HIGH` findings.
- Include `MEDIUM` or `LOW` findings only when the user requests them, the finding violates a mandatory requirement/constitution/design constraint, or addressing a blocking finding naturally resolves them.
- If the analysis outcome is PASS and no applicable blocking findings exist, make no changes and recommend `/speckit.implement`.
- If no applicable blocking findings exist but the analysis outcome is incomplete or internally inconsistent, do not recommend implementation. Explain the evidence gap and recommend the appropriate Analyze or prerequisite action.
- If only non-blocking observations remain, report them without expanding scope and do not invent remediation work.

If a lower-severity finding is explicitly marked blocking, verify the cited mandatory constraint before including it. If the blocking rationale is unclear, stop and request a fresh Analyze rather than redefining the finding.

### 3. Build one batched remediation route

Group all applicable findings by their earliest authoritative stage. Use only:

1. `CLARIFY` for requirement, scope, business-rule, constraint, expected-behavior, or acceptance-criteria uncertainty.
2. `DESIGN` for material user experience, interaction, information architecture, workflow, or responsive decisions.
3. `PLAN` for architecture, technology, dependencies, infrastructure, data approach, technical boundaries, implementation strategy, or unnecessary technical complexity.
4. `TASKS` for missing, unnecessary, inconsistent, incorrectly structured, or untraceable implementation work when upstream decisions remain sound.

Address multiple findings assigned to the same stage together in one pass. Process required stages in dependency order. Do not run a stage merely because it normally follows another stage.

Treat `Potential downstream impact` as advisory. Inspect current artifacts and add a downstream stage only when a finding or an actual upstream change demonstrates that reconciliation is necessary. For example, a Plan rationale change that leaves the implementation approach intact does not automatically require Tasks; a changed technical approach may require Tasks reconciliation. Never perform Tasks before an upstream stage that may invalidate it.

Before work begins, show the user a concise route grouped by stage and the Axxx IDs in scope. Do not ask for routine confirmation after each stage; invoking Remediate authorizes the requested remediation.

### 4. Reuse authoritative stage behavior

For each required stage, load its currently installed authoritative instruction file from the active project, normally `.github/skills/speckit-<stage>/SKILL.md`. If the stage is upstream-owned, use its installed upstream skill instructions. In the Better Spec Kit development repository, use the canonical skill where appropriate and preserve the installed dogfood copy.

Apply the relevant stage workflow and quality rules to the findings being addressed. This same-session instruction composition is not a nested command invocation. If the host directly supports invoking a stage skill, only describe it as invoked after it actually runs.

If a required stage instruction cannot be found, read, or safely followed, stop before making that stage's changes. Do not imitate the missing skill from memory or pretend it ran. Report completed work, the affected Axxx IDs, what remains, and the minimum next action.

When the authoritative stage changes an artifact, inspect the result before deciding whether downstream reconciliation is necessary. Keep the change focused and preserve unaffected valid content.

### 5. Handle decisions and partial progress

When a material user, product, or architecture decision cannot be inferred unambiguously from requirements and evidence:

- Pause at the responsible stage and ask only the necessary question.
- Reuse Clarify's installed question-and-answer behavior; do not guess or silently choose between materially different valid directions.
- After the user's answer, continue the same route only where the host supports continuation. Otherwise state the completed stage and enough context to resume without creating a new state ledger.

If a later stage fails or required evidence is unavailable, preserve correct completed work. Report the stages completed and remaining, affected findings, the reason for stopping, validation performed, and the minimum next action. Never claim full remediation when work remains.

### 6. Reconcile Tasks truthfully

Run Tasks only for a TASKS finding or when an upstream change materially affects the implementation ledger. Preserve valid tasks and change only affected sections. Remove, replace, or supersede stale work according to the existing task-ledger conventions. Do not mark work complete unless it was actually performed; do not add tasks that merely work around an unresolved upstream decision.

### 7. Report and hand off

Report concisely, as applicable:

- Findings considered, addressed, deferred, or not addressed, using their unchanged Axxx IDs.
- The ordered stages used and why downstream reconciliation was or was not needed.
- Artifacts changed, important decisions, user answers, and validation actually performed.
- Any partial progress, unaddressed finding, stop reason, and minimum recovery action.
- Whether stage instructions were consulted or a supported stage invocation actually ran.

Keep each finding OPEN in `analysis.md`; do not claim it passed. After completed applicable work, recommend:

**Next recommended step:**
`/speckit.analyze`

Analyze independently reassesses the artifacts and alone decides whether findings are resolved. If no blocking work was required, recommend the actual next workflow step based on the current Analyze outcome instead.
