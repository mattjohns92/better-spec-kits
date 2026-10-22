---
name: speckit-review
description: Independently assess whether a completed implementation is correct, maintainable, appropriately tested, and ready for acceptance.
compatibility: Requires access to the repository and relevant feature artifacts.
---

## User Input

```text
$ARGUMENTS
```

Consider any feature path, review focus, or other context supplied by the user. Do not ask the user to repeat information already present in the conversation or repository.

## Purpose

Review is the independent, post-convergence implementation-quality gate in Better Spec Kit:

`specify -> clarify -> design -> plan -> tasks -> implement -> converge -> review`

Run Analyze after Tasks and before Implement as the normal final pre-implementation check. It owns its `analysis.md` findings and does not modify upstream artifacts or implement remediation. Address blocking findings through their routed stages and rerun Analyze before implementation normally proceeds. GitHub Spec Kit owns `/speckit.converge`. When it identifies outstanding work, repeat `converge -> implement -> converge` until convergence is achieved, then proceed to Review.

Review answers: **Is the completed implementation correct, maintainable, appropriately tested, and ready for acceptance?**

Review inspects and reports. The initial operation is read-only: do not modify implementation, tests, specifications, design, plans, tasks, configuration, or other repository files. Do not automatically fix findings. Do not change an authoritative artifact merely to make an implementation discrepancy disappear.

Review remains read-only with respect to `tasks.md`. Tasks creates the original implementation plan, Implement may append Review-remediation work, and upstream Converge may append completeness work; Review never creates, edits, or checks off ledger tasks. Task completion does not transition finding status or establish acceptance.

For a completed feature, create or update a `review.md` artifact in the active feature directory. The file is the durable source of review outcome, evidence, current findings, and brief resolved-history. Keep it authoritative for the feature handoff and do not rely on temporary conversation state or session-only notes. Assign each material finding a stable ID and preserve it across repeated runs until the issue is resolved.

Implementation work may change code or tests to address a finding, but only a subsequent Review reassessment may change status to `RESOLVED`. Review is the only authority for changing finding status and for deciding whether the feature is ready to pass after fresh evidence.

## Establish Review Scope

1. Identify the intended feature from the user's input and current session context. Prefer an explicitly supplied feature directory or artifact. Otherwise inspect project metadata and repository context, including `.specify/feature.json` where present, the current work item, and relevant `spec.md` files. Do not assume a fixed feature directory or branch naming scheme. If multiple features remain plausible, ask one concise question before reviewing.
2. Discover available feature evidence: `spec.md`, `design.md`, `plan.md`, `tasks.md`, project constitution, research, contracts, data models, quickstart guidance, checklists, and other feature artifacts. Missing optional artifacts are not failures by themselves.
3. Discover the actual project structure, technologies, conventions, reusable functionality, and validation commands from repository files. Do not assume any particular language, framework, database, application type, test runner, or repository layout.
4. Inspect repository state before interpreting changes. Use the repository's available source-control and pull-request context to identify changed files and an appropriate comparison base. Consider staged, unstaged, and untracked changes where relevant. Do not assume `main`, `master`, or any other branch name. Prefer explicit pull-request/session context or configured tracking and merge-base evidence. If no defensible base can be identified, disclose that limitation and narrow conclusions accordingly.
5. Read the diff and the surrounding implementation needed to understand behavior, callers, contracts, side effects, and tests. A diff alone is not sufficient when surrounding code determines correctness.
6. Preserve unrelated user changes. Do not stage, reset, revert, or rewrite repository state.

## Convergence Evidence

For a Spec Kit feature, determine whether a Converge result is available and applies to the identified feature and current implementation. Discover evidence from the existing feature artifacts, task changes, repository state, and current session; do not require a specific result filename or introduce stored status tracking.

- **Current successful Converge evidence**: When evidence establishes successful convergence for this feature and implementation state, treat it as evidence of requirements completeness. Do not repeat an exhaustive requirement-by-requirement or task-by-task coverage pass. Continue independently with the four quality passes below and consult specific requirements when a quality finding depends on them.
- **Converge-added tasks remain outstanding**: Explain that convergence is incomplete, identify the known outstanding work, do not report final acceptance as PASS, and recommend completing implementation and rerunning Converge.
- **Missing, unavailable, stale, unrelated, or unverifiable evidence**: Clearly disclose that convergence is not established. Treat a prior result as stale rather than current when implementation changed afterward and no evidence re-establishes it. Perform enough independent requirements checking to avoid approving an obviously incomplete feature; do not claim convergence occurred. Missing convergence evidence alone MUST NOT force INCOMPLETE REVIEW.
- **Contradictory evidence**: A Converge result does not override observed missing requirements, incorrect behavior, or other concrete contrary evidence. Report the demonstrated issue and do not return PASS when it is material.
- **Standalone code review**: A standalone code review unrelated to a Spec Kit feature does not require Converge or feature artifacts.

An unchecked task marker alone is not proof that work remains if completion is demonstrated; likewise, checked tasks or a previous convergence claim do not override observed missing work.

### Optional Graphify Review Evidence

Graphify is optional repository intelligence. Use it only when a relevant graph and query surface are already available and materially help investigate the completed implementation. Before graph-informed Review after implementation or remediation, refresh a local graph with Graphify's documented incremental update (currently `graphify update .`) when source changed and that interface is available.

If graph currentness cannot be established, do not claim the graph is current; fall back to source inspection. Treat graph relationships as leads only and verify material findings against source and applicable tests or runtime evidence. Do not install Graphify, add hooks, or make Graphify availability a Review prerequisite.

## Review Passes

Perform and report each applicable pass independently. Record a concise conclusion and key evidence. A pass with no applicable UI or design requirement may be marked not applicable with a reason; do not invent requirements.

### 1. Correctness and Regression Risk

Inspect changed code and relevant surrounding implementation. Identify demonstrated incorrect behavior, edge cases, race conditions, invalid state transitions, error-handling problems, security and data-integrity risks, contract violations, regressions, and architecture violations. Confirm apparent issues in context and do not report speculative concerns.

### 2. Design Compliance

When the feature affects user experience and approved design decisions exist, verify workflows, interactions, responsive behavior, accessibility, and important UX decisions against the applicable design. Report material unexplained deviations, not harmless implementation differences. For features without UI impact, state that design requirements are not applicable and invent none.

### 3. Test Quality

Assess whether tests meaningfully demonstrate changed behavior, including important positive, negative, integration, and regression scenarios where relevant. Passing tests do not establish correctness by themselves. Do not request tests merely to increase coverage numbers.

Discover relevant validation commands and run them when practical and safe. Do not run commands that knowingly alter files, apply fixes, deploy, publish, or modify external state. Report commands run and actual results; distinguish checks not run from passing checks.

### 4. Simplicity, Reuse, and Maintainability

Assess demonstrated duplication, missed opportunities to reuse existing code, unnecessary abstractions, wrappers or layers, speculative configuration, unnecessary dependencies, premature generalization, and avoidable complexity. Report concrete problems, not style preferences or hypothetical concerns.

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
- **Status history**: a concise record of whether the finding is open or already closed, without rewriting the original issue record or merging it into `tasks.md`.

Use severity consistently:

- **BLOCKER**: The implementation must not be considered complete, such as a major missing requirement, critical correctness failure, serious security/data-integrity issue, or fundamental contradiction of the specification.
- **HIGH**: A material issue that should normally be resolved before completion, such as a likely production bug, important partial requirement, significant regression, major design violation, or important untested behavior with meaningful risk.
- **MEDIUM**: A demonstrated behavioral, testing, architecture, or maintainability issue worth correcting that does not invalidate the feature.
- **LOW**: A concrete small issue with legitimate value to fix. Never use LOW for style preferences or unsupported cleanup.

Do not treat missing optional artifacts or Ponytail as findings by themselves. Do not mark a requirement failed solely because a task checkbox is incomplete or passed solely because it is checked.

## Report and Outcome

Report the scope and comparison base used, evidence inspected, and validation commands actually run. Keep the report concise and specific to the changed behavior. Then summarize the four passes and list evidence-backed findings, grouped by severity. For each pass, state its conclusion and key evidence or limitation. Clearly distinguish completion-blocking findings from non-blocking improvements.

Finish with exactly one overall outcome:

- `PASS` - No material issues were found and the implementation can reasonably be considered complete.
- `FINDINGS` - One or more evidence-backed issues require consideration. Summarize findings by severity and clearly distinguish completion-blocking findings from non-blocking improvements.
- `INCOMPLETE REVIEW` - The evidence available was insufficient for a trustworthy determination. Name exactly what evidence or access was unavailable and why it prevents a reliable conclusion.

Use `INCOMPLETE REVIEW` only when a material limitation prevents a trustworthy assessment; otherwise disclose limitations and choose `PASS` or `FINDINGS` based on the evidence that was available. The final overall outcome must be exactly one of the three labels above.

Before the final outcome, give one concise, outcome-aware handoff:

- Summary is available at any workflow stage as a descriptive as-of account; only the final completion handoff is PASS-gated. For non-PASS or incomplete outcomes, Summary may still be run manually for description, but do not recommend or claim a final completed Summary; preserve the applicable remediation or evidence-gathering route.
- **Review PASS**: after Review `PASS`, recommend `/speckit-summary` as the explicit handoff for the same feature. Provide the feature context needed for an independent Summary run. Do not claim that Summary was invoked or written unless it actually happened. Automatic invocation is allowed only after supported-agent acceptance demonstrates reliable dispatch after PASS and no dispatch for blocking findings; otherwise use the manual command.
- **FINDINGS** with blocking findings: recommend `/speckit.implement` for implementation remediation, followed by Converge and another Review. Do not skip Converge or change Review finding status.
- **FINDINGS** with only non-blocking observations: identify them as non-blocking and do not imply that the feature is blocked.
- **INCOMPLETE REVIEW**: name the missing evidence and recommend the minimum action needed to obtain it.

Keep this handoff brief; the overall outcome remains the final label.
