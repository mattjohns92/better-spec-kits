---
name: speckit-analyze
description: Persistently analyze feature artifacts and challenge whether material decisions are justified and proportionate before implementation.
compatibility: Requires a GitHub Spec Kit project with an initialized .specify/ directory and completed feature tasks.
metadata:
  author: better-spec-kit
---

## User Input

```text
$ARGUMENTS
```

Consider any user-provided focus when analyzing, but do not let it override the feature requirements, project constitution, approved design, or available evidence.

## Pre-Execution Checks

Check whether `.specify/extensions.yml` exists. If it does, inspect `hooks.before_analyze` using the extension hook rules established by the project. Do not evaluate non-empty `condition` expressions. Skip hooks explicitly disabled. A mandatory hook must be invoked and completed before analysis; report optional hooks for the user to invoke. If the file is absent or no hook is registered, continue without a hook notice. If the YAML is invalid or unreadable, report the parser/read error and that no hooks, including mandatory hooks, were checked, then continue normally.

## Goal

Perform the normal final pre-implementation quality gate:

`specify → clarify → design → plan → tasks → analyze → implement`

Analyze answers both:

- Are the applicable requirements, decisions, and planned tasks a coherent set of instructions?
- Are the material product and technical choices justified and proportionate to the current feature?

Analyze challenges and records findings. It does not remediate them.

## Operating Constraints

- **Analyze is read-only except for its own artifact.** Create or update only `analysis.md` in the active feature directory. Do not edit `spec.md`, clarification decisions, `design.md`, `plan.md`, `tasks.md`, constitution, implementation files, tests, or any other file.
- **Analyze owns `analysis.md` and its findings.** Other workflows must not resolve, delete, renumber, or rewrite an Analyze finding or claim that Analyze accepted remediation.
- GitHub Spec Kit continues to own its upstream Analyze capability. Preserve useful upstream consistency checks while applying this enhanced contract.
- This proportionality challenge extends the existing Analyze stage; do not create a parallel finding ledger, a general architecture-review framework, or a new workflow stage.
- The constitution, approved requirements, design decisions, and discovered project constraints remain authoritative.
- Analyze is technology-agnostic. Do not assume a language, framework, database, deployment platform, repository layout, or application type.
- Do not implement a finding, invoke Clarify/Design/Plan/Tasks automatically, or run an automatic Analyze-remediate-Analyze loop. Feature 006 remediation orchestration is out of scope.

## Execution Steps

### 1. Resolve the active feature

Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireSpec -RequireTasks -IncludeTasks` once from the repository root. Parse `FEATURE_DIR` and `AVAILABLE_DOCS`; use the active feature directory returned by setup rather than inferring it from a branch name. If setup fails or required inputs are missing, report the exact impediment and do not report PASS.

For single quotes in arguments such as `I'm Groot`, escape them as `I'\''m Groot` or use double quotes where possible.

### 2. Read applicable evidence

Read the active feature's:

- Required: `spec.md`, `plan.md`, and `tasks.md`.
- If present: `design.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`, and prior `analysis.md`.
- Project constitution at `.specify/memory/constitution.md`, if present.
- Relevant established project conventions and existing capabilities where practical. Search only enough project context to support material decisions; do not turn a small feature into a repository-wide architecture review.

Use clarification decisions recorded in the specification. Do not require optional artifacts that do not apply to the feature. Treat material decisions in an existing `design.md` as authoritative; Analyze may identify a concern and route it to DESIGN, but must not redesign the interface.

If a relevant project convention or justification is available outside the feature artifacts, consider it before challenging a decision. Do not demand that each plan repeat settled project-wide rationale. If evidence cannot be accessed, record the limitation rather than guessing.

### 3. Build the analysis context

Identify the feature and the artifact state actually examined. Note absent optional artifacts only when their absence limits a responsible conclusion. Record important evidence limitations, including unavailable project context or validation boundaries. Do not claim to have inspected, executed, or verified anything that was not inspected, executed, or verified.

If `analysis.md` already exists:

- Read its current findings and resolved history before assigning IDs.
- Preserve the ID of an OPEN finding when the same underlying issue remains, even if the wording or evidence is updated.
- Assign the next unused sequential `A001`, `A002`, ... ID only to a materially distinct finding.
- Never delete or reuse an ID. Do not move a finding to resolved history merely because an upstream artifact changed; independently verify that the underlying issue is addressed.

### 4. Perform proportionate analysis passes

Scale analysis to the feature's material risk. A simple, well-justified feature can pass quickly. Do not invent findings, challenge trivial implementation details, or demand written justification for obvious language/framework-level choices.

#### A. Artifact consistency

Check applicable feature artifacts against one another and the constitution/project rules for material:

Retain the useful upstream passes explicitly: duplication detection, ambiguity detection, underspecification, constitution alignment, coverage gaps, and cross-artifact inconsistency.

- Contradictions, incompatible assumptions, or ambiguous terminology.
- Missing requirement coverage or a requirement with no credible implementation path.
- Plan decisions not represented in tasks, or substantial tasks unsupported by the specification, approved design, plan, constitution, project conventions, or demonstrated need.
- Design decisions contradicted by the plan.
- Constitution conflicts, duplicated responsibilities, or meaningful ordering/ownership conflicts.

Do not invent a missing-artifact problem when an optional artifact is not relevant to the feature.

#### B. Requirement and decision traceability

Before comparing downstream artifacts, establish the earliest reliable source of user intent. Prefer an applicable Scope Feature Brief's preserved original user request, confirmed scope-owned intent, decisions, boundaries, exclusions, and downstream questions. If no brief exists, use the earliest reliable user intent available in the feature artifacts and note material evidence limitations. Consider explicit clarification or approval, existing application constraints, and demonstrated technical necessity as distinct evidence sources.

For each material requirement, behavior, abstraction, and planned work item, determine whether it traces to that intent, an explicit user decision, a relevant project constraint, or a demonstrable technical need. Later artifacts repeating a requirement do not, by repetition alone, establish its origin or user approval. Ask:

- What current requirement or constraint caused this work, and where did it originate?
- Is it needed for this feature and solving a demonstrated problem?
- Is it speculative preparation for hypothetical future work?
- Does the project already provide a suitable capability that could be extended?
- Has work appeared in Plan or Tasks that the user did not request or explicitly approve?
- Does each material requirement have a credible implementation path?

Do not require every trivial implementation detail to map to a functional requirement.

#### C. Decision, minimum-solution, and change-surface challenge

Challenge material product, architecture, technology, and operational choices for proportionality. Consider whether the feature introduces unjustified dependencies, frameworks, services, databases, caches, queues, workers, repositories, managers, coordinators, adapters, wrappers, abstraction layers, configuration systems, compatibility layers, event systems, infrastructure, deployment changes, persistence mechanisms, custom implementations, or speculative extensibility.

Before judging whether a smaller solution is adequate, inspect relevant current project behavior, existing mechanisms, and established patterns where practical. Compare the apparent locality of the requested outcome with the proposal's change-surface. For broad changes, ask:

- Why must shared infrastructure, global state, shared APIs, or adjacent features change?
- What existing mechanism was insufficient, and what evidence shows feature-local work is inadequate?
- Which changes directly satisfy acceptance, which are supporting improvements, and which could be removed while preserving the agreed outcome?

Do not use file, line, task, service, component, or complexity-score thresholds. Breadth is evidence to investigate, not proof of over-engineering; a large change can be correct. Size alone MUST NOT prevent PASS or cause a finding. Existing architecture is the default, not unquestionable: challenge it only with concrete feature-specific evidence of a limitation or requirement mismatch.

For material decisions, consider:

1. What current requirement, constraint, or demonstrated current problem justifies the choice?
2. What existing project capability was considered?
3. Could the existing responsibility be extended instead?
4. Is there a materially simpler solution that meets the requirement?
5. What maintenance, operational, cognitive, security, or failure-mode cost is added?
6. Is the complexity needed now or only for hypothetical future needs?
7. Does it create another way to do something the project already does?
8. Does each architectural layer own a demonstrated responsibility?
9. Is custom functionality duplicating an adequate project, platform, or established dependency capability?
10. Is the benefit sufficient to justify the added complexity?

Classify material complexity by its current evidence:

- **Necessary complexity** is required by the agreed outcome or demonstrated system constraints. Keep it and record concise evidence in Analysis Context: the originating requirement or decision, the relevant constraint or project evidence, and why a simpler approach would not satisfy the outcome.
- **Unnecessary complexity** can be removed while still meeting the agreed outcome without an unacceptable trade-off. Raise an actionable finding recommending simplification at the earliest authoritative stage.
- **Potentially valuable but optional expansion** is not needed for the agreed outcome but has a legitimate current benefit. Do not silently approve or remove a materially consequential expansion when both the simpler and expanded approaches are reasonable and no applicable user decision is recorded.

When user judgement is required, use the existing Axxx finding and clearly mark the decision as required. Include the original intent, proposed expansion, why it is challenged, the simpler alternative, the benefit, the added cost/complexity, and the specific decision. Use the following conditional details within the existing finding; do not create a separate finding system or status:

```markdown
**Decision required:** YES
**Category:** Scope Expansion
**Original intent:** <agreed outcome>
**Proposed expansion:** <additional behavior or work>
**Challenge:** <why the addition is not required and what evidence was inspected>
**Simpler alternative:** <smallest viable way to meet the agreed outcome>
**Benefit:** <legitimate benefit of the expansion>
**Cost/complexity:** <concrete scope, UX, architecture, or maintenance cost>
**Decision requested:** Keep the improvement, simplify to the agreed outcome, or defer it.
```

An unresolved material user decision is blocking and MUST remain OPEN until a later Analyze run verifies that an applicable decision has been recorded and the current proposal reflects it. Use the existing severity and blocking rules; do not create a new severity or status.
Before raising a user-decision finding, recognize explicit, applicable decisions already recorded in authoritative artifacts. Do not repeat the same challenge when the user has already settled that trade-off, and do not generalize an approval to materially different work.

If the choice changes a Scope-owned boundary, use the existing `CLARIFY` route for the scope/intent uncertainty. The resolution direction MUST tell Remediate/Clarify to stop before downstream edits and return the decision to Scope. Do not change the Scope record or add a `SCOPE` route. After Scope reassesses the boundary, only reconcile downstream artifacts that the decision actually affects.

Existing architecture is the default, not unquestionable. Do not recommend replacing an established technology merely because an alternative exists. Challenge an established choice only with concrete feature-specific evidence of a limitation, risk, incompatibility, maintainability, security, performance, operational cost, or requirement mismatch. Use a higher evidence threshold for established project decisions than for new complexity introduced by the current plan.

Statements such as “generic for future use” are not justification when the future need is outside the current requirements. Respect separation of responsibility when it solves a demonstrated problem; do not endorse layers for symmetry or theoretical purity.

If Ponytail's relevant planning/simplicity capability is installed and available, it may provide supporting evidence. Do not require Ponytail, search for or emulate unavailable Ponytail functionality, or treat its opinion as authority over the constitution, requirements, design, or project evidence.

#### D. Product and UX challenge

Identify material unnecessary steps, repeated data entry, navigation/modal transitions, approval stages, or workflow complexity only when supported by feature evidence or conflict with approved design. Record the issue and route it to DESIGN. Do not redesign the interface or silently replace an approved design decision.

#### E. Testing and execution boundary

Use the strongest practical evidence at the actual execution boundary. Do not require substantial infrastructure solely to test behavior owned by an external runtime unless that infrastructure is independently justified. This is not an excuse to omit automated tests for behavior the repository owns and can execute. Distinguish repository-owned packaging/contracts from behavior executed by an external agent; do not claim a static skill-text test proves agent behavior.

Static contract assertions cover repository-owned behavior only; they do not prove external agent behavior. Keep supported-agent acceptance separate and do not add a heavyweight evaluation harness solely to simulate the external runtime.

### 5. Record findings and remediation routes

Raise a finding only when it is material, supported by available evidence, and actionable or important to safe progression. Explain the actual evidence; do not turn missing evidence into an invented architecture recommendation.

Use only these severity values:

- `BLOCKER`
- `HIGH`
- `MEDIUM`
- `LOW`

By default, BLOCKER and HIGH findings are blocking; MEDIUM and LOW are non-blocking unless they demonstrate violation of an explicit requirement, constitution rule, approved design decision, or other mandatory project constraint. Include an explicit `Blocking: YES` or `Blocking: NO` field for every current finding and state evidence for any severity-default exception.

Use HIGH for material new complexity that is unsupported by current requirements, such as a new dependency, service, or persistence layer without demonstrated need. Reserve BLOCKER for a direct mandatory-constraint violation or a risk that makes implementation unsafe to proceed.

Route each actionable finding to the earliest authoritative stage capable of addressing the underlying issue. Use exactly one of:

- `CLARIFY`: Requirement, scope, business rule, permission, constraint, expected behavior, or acceptance-criteria uncertainty.
- `DESIGN`: Material UX, interaction, information architecture, workflow, or responsive-behavior decision.
- `PLAN`: Architecture, technology, dependencies, infrastructure, data approach, technical boundaries, implementation strategy, or unnecessary technical complexity.
- `TASKS`: Missing, unnecessary, incorrectly structured, inconsistent, or untraceable implementation work when upstream decisions are sound.

Do not route everything to TASKS. A questionable plan decision is not repaired by adding or reshaping tasks. When a task exposes an upstream requirements/design/plan mismatch, route to that earlier authoritative stage.

For each finding, identify the decision or artifact, problem/question, evidence, why it matters, relevant references, and resolution direction. Where reasonably predictable, include structured `Potential downstream impact` with only likely affected artifacts. This metadata is advisory; do not edit those artifacts. A material UX finding is routed to DESIGN, never solved by Analyze.

### 6. Determine the outcome

Choose exactly one outcome for the latest run:

- **PASS**: Evidence is sufficient to proceed responsibly and there are no OPEN blocking findings. Non-blocking observations may remain. Do not invent criticism to avoid PASS.
- **FINDINGS**: One or more OPEN blocking findings require upstream remediation before implementation should normally proceed.
- **INCOMPLETE ANALYSIS**: Evidence is insufficient to make a responsible determination. State the evidence limitation. Do not guess or convert missing evidence into an architectural recommendation.

If an evidence gap itself prevents safe progression, choose INCOMPLETE ANALYSIS. If the available evidence supports a blocking issue, record that finding and use FINDINGS. The blocking count is the number of current OPEN findings with `Blocking: YES`.

### 7. Persist `analysis.md`

Create or update only `${FEATURE_DIR}/analysis.md`. Keep it concise and understandable without conversation history; do not copy entire source artifacts into it.

Use this structure and stable labels:

```markdown
# Pre-Implementation Analysis

**Outcome:** PASS | FINDINGS | INCOMPLETE ANALYSIS
**Blocking findings:** <count>

## Analysis Context

**Analyzed:** <feature and relevant artifact state>
**Evidence limitations:** <limitations or None identified>
**Material decisions retained:** <material complexity kept, its origin, and supporting evidence; or None identified>

## Current Findings

### A001 — <short title>

**Severity:** BLOCKER | HIGH | MEDIUM | LOW
**Status:** OPEN
**Blocking:** YES | NO
**Remediation stage:** CLARIFY | DESIGN | PLAN | TASKS

**Decision being challenged:**
<decision or artifact>

**Problem or question:**
<concrete issue or unresolved question>

**Evidence:**
<available evidence and relevant references>

**Why it matters:**
<material impact>

**References:**
<artifact/project references or None identified>

**Potential downstream impact:**

- <only likely affected artifact names, or None identified>

**Resolution direction:**
<appropriate direction or question>

## Resolved Findings

### A002 — <short title>

**Severity:** <original severity>
**Status:** RESOLVED
**Resolution verified:** <concise evidence from the resolving Analyze run>
```

Use `## Current Findings` with a concise `No open findings.` when there are none. Use `## Resolved Findings` with `None.` when no finding has been resolved. Omit potential downstream detail only when it is not reasonably predictable; use `None identified` when the field was considered and no impact is likely. Non-actionable observations may omit a remediation stage only when no upstream action is appropriate.

When updating existing analysis:

- Preserve unresolved finding IDs and update their current evidence/wording without changing their underlying identity.
- Only this Analyze run may move an OPEN finding to RESOLVED, and only after independently checking current evidence.
- Move the resolved record to `Resolved Findings` with concise resolution verification. Do not retain a verbose copy in Current Findings.
- Preserve concise resolved history; do not delete it merely to make the current report shorter.
- Recompute the blocking count and outcome from current evidence and findings.

Before finishing, verify the only file created or changed by Analyze is the active feature's `analysis.md`. If another file was changed inadvertently, restore its prior content before reporting; never silently leave mutations to authoritative input artifacts.

## Completion Report

Report the outcome, blocking findings count, `analysis.md` path, a concise summary of any current findings and their remediation stages, evidence limitations, and validation actually performed. State that no upstream artifacts were modified. Do not claim a finding was resolved unless this Analyze run verified it.

Give one concise, outcome-aware next step:

- **PASS**: recommend `/speckit.implement` because no OPEN blocking findings remain.
- **FINDINGS** with OPEN blocking findings: recommend `/speckit.remediate` because upstream artifacts need reconciliation before implementation.
- **INCOMPLETE ANALYSIS**: name the missing evidence or prerequisite and its recovery action. Do not recommend implementation.

Never recommend `/speckit.implement` while OPEN blocking findings remain. Non-blocking observations do not change a PASS recommendation.

## Mandatory Post-Execution Hooks

Check whether `.specify/extensions.yml` exists. If it does, inspect `hooks.after_analyze` with the same hook rules as the pre-execution checks. Invoke and wait for each enabled mandatory hook. Report optional hooks for the user. If the YAML is invalid or unreadable, report the error and that no hooks were checked, including mandatory hooks. If the file or hooks are absent, skip silently.
