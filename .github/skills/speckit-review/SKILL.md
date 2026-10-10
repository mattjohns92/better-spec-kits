---
name: speckit-review
description: Independently assess whether an implemented feature is complete, correct, and ready to accept.
compatibility: Requires access to the repository and relevant feature artifacts.
---

## User Input

```text
$ARGUMENTS
```

Consider any feature path, review focus, or other context supplied by the user. Do not ask the user to repeat information already present in the conversation or repository.

## Purpose

Review is the independent, post-implementation completion gate in Better Spec Kit:

`specify -> clarify -> design -> plan -> tasks -> implement -> review`

Analyze remains available as an optional upstream consistency check. It is not a required step in this workflow.

Review answers: **Does the completed implementation deliver what was agreed, correctly and completely, without material regressions or unnecessary complexity?**

Review inspects and reports. The initial operation is read-only: do not modify implementation, tests, specifications, design, plans, tasks, configuration, or other repository files. Do not automatically fix findings. Do not change an authoritative artifact merely to make an implementation discrepancy disappear.

## Establish Review Scope

1. Identify the intended feature from the user's input and current session context. Prefer an explicitly supplied feature directory or artifact. Otherwise inspect project metadata and repository context, including `.specify/feature.json` where present, the current work item, and relevant `spec.md` files. Do not assume a fixed feature directory or branch naming scheme. If multiple features remain plausible, ask one concise question before reviewing.
2. Discover available feature evidence: `spec.md`, `design.md`, `plan.md`, `tasks.md`, project constitution, research, contracts, data models, quickstart guidance, checklists, and other feature artifacts. Missing optional artifacts are not failures by themselves.
3. Discover the actual project structure, technologies, conventions, reusable functionality, and validation commands from repository files. Do not assume any particular language, framework, database, application type, test runner, or repository layout.
4. Inspect repository state before interpreting changes. Use the repository's available source-control and pull-request context to identify changed files and an appropriate comparison base. Consider staged, unstaged, and untracked changes where relevant. Do not assume `main`, `master`, or any other branch name. Prefer explicit pull-request/session context or configured tracking and merge-base evidence. If no defensible base can be identified, disclose that limitation and narrow conclusions accordingly.
5. Read the diff and the surrounding implementation needed to understand behavior, callers, contracts, side effects, and tests. A diff alone is not sufficient when surrounding code determines correctness.
6. Preserve unrelated user changes. Do not stage, reset, revert, or rewrite repository state.

## Review Passes

Perform and report each of these five passes independently. Record a concise conclusion and the evidence considered for each. A pass with no applicable UI or artifact requirement may be marked not applicable with a reason; do not invent requirements.

### 1. Requirements and Task Coverage

Trace delivered behavior to the agreed feature intent. Compare the implementation with each material functional requirement, acceptance scenario, success criterion, approved scope, and task outcome. Inspect the result of tasks marked complete rather than trusting checkboxes. Identify omitted requirements, incomplete outcomes, and unapproved behavior that materially expands or contradicts scope.

### 2. Design Compliance

When `design.md` exists and the feature affects the user experience, compare the implementation with its material workflows, information architecture, interactions, responsive behavior, states and feedback, accessibility needs, and decisions about established project primitives. Report material unexplained deviations, not harmless implementation differences.

When the feature has no UI impact and no design artifact, state that this pass has no applicable design requirements and succeeds without inventing any.

### 3. Correctness and Regression Risk

Review the relevant code and its surrounding implementation like a careful pull-request reviewer. Look for demonstrated incorrect behavior, edge cases, invalid transitions, error-handling gaps, data-integrity risks, contract violations, security or accessibility problems, regressions, required compatibility failures, and conflicts with established architecture or conventions. Confirm an apparent issue in its actual context before reporting it. Do not report speculative concerns.

### 4. Test Quality

Determine whether the available tests and validation meaningfully demonstrate the changed behavior. Check for material requirements without behavioral evidence, important negative or failure paths, tests that assert implementation details but could pass while behavior is broken, regression coverage, and integration or contract coverage when a boundary changed. Do not request tests merely to increase coverage numbers.

Discover the project's relevant validation commands. Run them when practical only if they are appropriate and will not violate read-only behavior. Do not run commands that knowingly alter tracked files, apply fixes, deploy, publish, or modify external state. Report commands actually run and their real results; distinguish not-run checks from passing checks.

### 5. Simplicity, Reuse, and Maintainability

Assess demonstrated duplication, missed reuse, parallel behavior, unnecessary abstractions or layers, wrappers, files, configuration, dependencies, compatibility code, or premature generalization. Compare choices with existing project functionality and the current requirement. Report only concrete problems; do not turn style preference or hypothetical future reuse into findings.

#### Ponytail Integration

If the installed skill/plugin capability `ponytail-review` is available in the current agent environment, invoke that actual capability on this feature's changes as additional simplicity, reuse, and maintainability evidence. Prefer the installed skill/plugin invocation mechanism; do not search only inside the target repository. Do not substitute reading Ponytail guidance or a generic self-review for invoking the available review capability.

Assess every Ponytail observation against the same evidence standard as other findings. Ponytail cannot override the project constitution, feature specification, approved design, or explicit project requirements. If Ponytail is unavailable or cannot actually be invoked, continue the Better Spec Kit review and disclose that limitation; its absence alone does not make the review incomplete.

## Evidence and Findings

Be deliberately critical but not noisy. Report a finding only when concrete evidence demonstrates a real issue. A clean review with no findings is valid.

Every material finding must include:

- **Severity**: `BLOCKER`, `HIGH`, `MEDIUM`, or `LOW`.
- **Location**: affected file and relevant line or symbol, when applicable.
- **Problem**: the concrete incorrect, missing, or unnecessarily risky behavior.
- **Evidence**: observed code, test result, artifact, or reproducible case supporting the finding.
- **Impact**: the user, requirement, correctness, safety, or maintainability consequence.
- **Reference**: relevant requirement, design decision, or task, when applicable.
- **Resolution direction**: the smallest appropriate direction for addressing it; do not make the change.

Use severity consistently:

- **BLOCKER**: The implementation must not be considered complete, such as a major missing requirement, critical correctness failure, serious security/data-integrity issue, or fundamental contradiction of the specification.
- **HIGH**: A material issue that should normally be resolved before completion, such as a likely production bug, important partial requirement, significant regression, major design violation, or important untested behavior with meaningful risk.
- **MEDIUM**: A demonstrated behavioral, testing, architecture, or maintainability issue worth correcting that does not invalidate the feature.
- **LOW**: A concrete small issue with legitimate value to fix. Never use LOW for style preferences or unsupported cleanup.

Do not treat missing optional artifacts or Ponytail as findings by themselves. Do not mark a requirement failed solely because a task checkbox is incomplete or passed solely because it is checked.

## Report and Outcome

Report the scope and comparison base used, evidence inspected, and validation commands actually run. Then summarize the five passes and list evidence-backed findings, grouped by severity. For each pass, state its conclusion and the key evidence or limitation.

Finish with exactly one overall outcome:

- `PASS` - No material issues were found and the implementation can reasonably be considered complete.
- `FINDINGS` - One or more evidence-backed issues require consideration. Summarize findings by severity and clearly distinguish completion-blocking findings from non-blocking improvements.
- `INCOMPLETE REVIEW` - The evidence available was insufficient for a trustworthy determination. Name exactly what evidence or access was unavailable and why it prevents a reliable conclusion.

Use `INCOMPLETE REVIEW` only when a material limitation prevents a trustworthy assessment; otherwise disclose limitations and choose `PASS` or `FINDINGS` based on the evidence that was available. The final overall outcome must be exactly one of the three labels above.
