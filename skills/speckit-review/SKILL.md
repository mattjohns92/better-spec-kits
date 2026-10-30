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

Before assessing source, read `instructions/shared-source-ownership.instructions.md` and inspect ownership status. If the selected work item's claim is held by the current conversation, rely on its existing token owner to keep the tree stable. If another item owns the source, state is UNKNOWN, or the tree's stability/attribution cannot otherwise be established, stop the affected assessment and report the evidence gap. Review never claims, releases, recovers, or modifies source ownership. If findings require source changes, return them through Implement, which must acquire or revalidate ownership before editing.

Review remains read-only with respect to `tasks.md`. Tasks creates the original implementation plan, Implement may append Review-remediation work, and upstream Converge may append completeness work; Review never creates, edits, or checks off ledger tasks. Task completion does not transition finding status or establish acceptance.

For a completed feature, create or update a `review.md` artifact in the active feature directory. The file is the durable source of review outcome, evidence, current findings, and brief resolved-history. Keep it authoritative for the feature handoff and do not rely on temporary conversation state or session-only notes. Assign each material finding a stable ID and preserve it across repeated runs until the issue is resolved.

For a Quick item, Review is the mandatory independent gate after Quick validation. Review consumes the authoritative Q Brief (or an exact legacy Scope Q handoff), applicable approved Design, implementation, and validation/runtime evidence. Write the same `review.md` model under the Q folder; for a legacy handoff, use the matching supplemental Q folder and leave the Scope-owned handoff unchanged. Quick Review does not require Feature `spec.md`, Tasks, Converge, or Summary. A current Quick Review PASS completes the Review gate for that Q item; it does not hand off to Feature Summary.

For a Quick Batch, review each Q item independently against its own Brief and applicable Design. Keep each outcome and finding set in that item's `review.md`; do not combine separate Q results into one batch Review. Shared integration-validation evidence may be referenced from each affected Q Review.

Implementation work may change code or tests to address a finding, but only a subsequent Review reassessment may change status to `RESOLVED`. Review is the only authority for changing finding status and for deciding whether the feature is ready to pass after fresh evidence.

## Establish Review Scope

1. Identify the intended Feature or Quick item from the user's input and current session context. Prefer an explicitly supplied feature directory, Q ID, or artifact. For an exact Q ID, resolve exactly one new `specs/quick/Q###-<slug>/brief.md` or one legacy `specs/.scope/Q###-<slug>.md`; duplicate IDs or conflicting ID/slug paths are ambiguous and must stop for clarification. New Q work uses its Brief's directory for `review.md`. A legacy Q keeps its `.scope` handoff as the Brief and uses the matching `specs/quick/Q###-<slug>/` folder for supplemental Review artifacts; do not copy, move, or rewrite the handoff. Do not select by title, recency, branch, or partial ID. If multiple work items remain plausible, ask one concise question before reviewing.
2. Discover evidence appropriate to the selected work item. A Feature may use `spec.md`, `design.md`, `plan.md`, `tasks.md`, project constitution, research, contracts, data models, quickstart guidance, checklists, and other feature artifacts; missing optional artifacts are not failures by themselves. A Quick uses its authoritative Brief/handoff, optional approved `design.md` and concepts, actual implementation, validation/runtime evidence, and Q-local `review.md` when present. Do not require Feature-only artifacts for Quick Review.
3. Discover the actual project structure, technologies, conventions, reusable functionality, and validation commands from repository files. Do not assume any particular language, framework, database, application type, test runner, or repository layout.
4. Inspect repository state before interpreting changes. Use the repository's available source-control and pull-request context to identify changed files and an appropriate comparison base. Consider staged, unstaged, and untracked changes where relevant. Do not assume `main`, `master`, or any other branch name. Prefer explicit pull-request/session context or configured tracking and merge-base evidence. If no defensible base can be identified, disclose that limitation and narrow conclusions accordingly.
5. Read the diff and the surrounding implementation needed to understand behavior, callers, contracts, side effects, and tests. A diff alone is not sufficient when surrounding code determines correctness.
6. Preserve unrelated user changes. Do not stage, reset, revert, or rewrite repository state.

## Convergence Evidence

The Converge rules below apply to Feature Review. Quick work does not require Feature-only Converge; assess completeness against the Q Brief, applicable approved Design, actual implementation, and validation/runtime evidence instead. Missing Feature artifacts or Converge output alone do not make a Quick Review incomplete.

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

## Runtime Evidence

When runtime execution materially strengthens confidence and is safely available, independently exercise or corroborate material runtime behavior at its relevant execution boundary. Do not accept Implement's claim as the sole evidence that a runtime check succeeded. Reuse project tooling or a callable host capability; do not install a browser framework merely for Review or force browser checks onto non-browser behavior.

Derive checks from approved requirements and risk. For browser behavior, inspect relevant interaction/state and, where supported, attributable console or request failures. For API/process/worker behavior, use the existing appropriate execution path. Preserve approved Design as the target. Keep runtime evidence complementary to source inspection and tests; a passing static test is not proof of execution.

Report only what ran: runtime used, behavior exercised, observed result, relevant failures, material untested behavior, and environment limitations. Distinguish product failure from unavailable/expired authentication, dependency, sandbox, hardware, or host tooling. Do not put credentials or session material in artifacts. Do not weaken authentication or perform unsafe production actions. Do not fail a feature for unrelated known noise. Missing optional runtime evidence alone is not an automatic failure; judge whether the specific unverified behavior prevents a trustworthy review.

When authenticated runtime evidence relies on manual login followed by locally persisted browser state, independently confirm that the active tool supports capture/reuse and that the reported destination is excluded from version control; do not commit authentication state or inspect/repeat credential or session contents. External test identities must be existing, user-provided, or project-provisioned; BSK may guide the user in obtaining one but does not provision it. Do not require a permanent E2E test solely for agent-driven browser verification.

## Review Passes

Perform and report each applicable pass independently. Record a concise conclusion and key evidence. A pass with no applicable UI or design requirement may be marked not applicable with a reason; do not invent requirements.

### 1. Correctness and Regression Risk

Inspect changed code and relevant surrounding implementation. Identify demonstrated incorrect behavior, edge cases, race conditions, invalid state transitions, error-handling problems, security and data-integrity risks, contract violations, regressions, and architecture violations. Confirm apparent issues in context and do not report speculative concerns.

### 2. Design Compliance

For significant UI work with an approved Design, compare the actual implementation to the authoritative approved Design using the strongest practical current evidence. Report material unexplained mismatch even when Converge or functional tests passed. Distinguish approved refinements and harmless rendering variation from Design drift; state when visual comparison was unavailable or covered only part of the experience.

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
- **Quick Review PASS**: Quick Review PASS completes Q work without Summary or Converge. Do not recommend, create, invoke, or claim a Feature `summary.md`. When composed by Auto, return control so Auto can verify the current Q completion boundary and stop there.
- **Feature Review PASS**: after Review `PASS`, recommend `/speckit-summary` as the explicit handoff for the same feature. Provide the feature context needed for an independent Summary run. When composed by Auto, return control to Auto, which loads and executes Summary before feature completion; same-turn instruction composition does not require automatic command dispatch. Do not claim that Summary was invoked or written unless it actually happened. For standalone Review, use the manual command unless supported-agent acceptance demonstrates reliable automatic dispatch after PASS and no dispatch for blocking findings.
- **Quick FINDINGS** with completion-blocking findings: Quick findings return to Quick for remediation, validation, and Review. Identify the exact Q ID; do not route Q remediation through Feature Converge or alter finding status. When composed by Auto, return control to Auto for the Quick remediation route.
- **Feature FINDINGS** with blocking findings: recommend `/speckit.implement` for implementation remediation, followed by Converge and another Review. Do not skip Converge or change Review finding status.
- **FINDINGS** with only non-blocking observations: identify them as non-blocking and do not imply that the feature is blocked.
- **INCOMPLETE REVIEW**: name the missing evidence and recommend the minimum action needed to obtain it.

Keep this handoff brief; the overall outcome remains the final label.
