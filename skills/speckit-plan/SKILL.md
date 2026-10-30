---
name: "speckit-plan"
description: "Execute the implementation planning workflow using the plan template to generate design artifacts."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/plan.md"
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before planning)**:

- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_plan` key
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that `.specify/extensions.yml` could not be read (include the parser error) and that no hooks were checked, including any mandatory (`optional: false`) hooks registered there, then continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):

    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

  - **Mandatory hook** (`optional: false`):

    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```

    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.

- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

### Optional Graphify Repository Discovery

Graphify is optional repository intelligence. Use it only when a relevant graph and query surface are already available and can materially reduce discovery. Treat graph output as a map, not proof: verify material conclusions against authoritative source. If Graphify or a useful graph/query surface is unavailable or unhelpful, continue with existing repository investigation.

Use Graphify to locate architecture, dependencies, extension points, and consumers; inspect authoritative source before settling material implementation decisions.

## Outline

1. **Setup**: Resolve the exact Feature from the invocation or current conversation using the shared Work Item Identity instruction. Set `SPECIFY_FEATURE_DIRECTORY` to its recorded `feature_directory` only while invoking `.specify/scripts/powershell/setup-plan.ps1 -Json`, then restore the previous environment value. Parse JSON for FEATURE_SPEC, IMPL_PLAN, FEATURE_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**:
   - Read FEATURE_SPEC and `.specify/memory/constitution.md`.
   - Load IMPL_PLAN template (already copied).
   - Check for `${FEATURE_DIR}/design.md`.
   - If `design.md` exists:
     - Read it completely.
     - Treat documented UI/UX decisions as authoritative feature requirements alongside FEATURE_SPEC.
     - Preserve documented user workflows, information hierarchy, interaction patterns, responsive behaviour, application states, accessibility requirements, and component reuse decisions during planning.
     - Do NOT silently replace established UX decisions with implementation-convenient alternatives.
   - If a documented design decision conflicts with the constitution or is technically impractical, identify the constraint and evidence, stop dependent work, and present the proposed revision for explicit user approval. Require explicit user approval before updating `design.md` or planning dependent work; after approval, record the revised decision and rationale.
   - If `design.md` does not exist:
     - Determine from FEATURE_SPEC whether the feature contains meaningful user-facing UI changes.
     - If significant UI work appears to have skipped the design stage, STOP and instruct the user to run `/speckit-design` before `/speckit-plan`.
     - Backend-only features and features with no meaningful UI impact may proceed without `design.md`.
   - Before planning significant UI work, inspect `design.md` for a material open UX question or a selection awaiting the user. If either remains, STOP and return to `/speckit-design`; do not plan around an unresolved choice.
   - When no material choice remains, proceed using the recorded selected/current direction. Do not promote rejected or abandoned alternatives into requirements or implementation tasks.

### Approved Scope Preservation

Before planning material requirements, trace them to the earliest reliable
user intent, explicit clarification or approval, an accepted recommendation,
or a demonstrated project constraint or necessary consequence. A requirement's
presence or repetition in `spec.md`, `design.md`, or another downstream artifact
does not by itself establish approval. Do not plan work that conflicts with a
recorded rejection or deferral. If a material requirement lacks authorized
provenance or presents an unresolved product choice, stop and return it to
Specify/Clarify; do not treat it as settled scope. Keep technical choices within
the approved outcome Plan-owned, and explain material necessary supporting
work with its evidence.

When `design.md` identifies an approved concept or refinement, the approved
Design is the authoritative visual and interaction target. Plan may choose how
to deliver it within the existing architecture, but must preserve its material
layout, hierarchy, placement, responsive behavior, and interactions. Do not
substitute a materially different experience for implementation convenience or
component reuse. If a real constraint prevents the approved target, document
the evidence and return the proposed change for Design/user approval before
planning dependent work.

### Runtime Verification Constraints

Identify runtime, authentication, role, sandbox, external side-effect, or hardware constraints when they affect implementation strategy. Reuse the project's existing runtime/browser framework or supported host capability; a detected project config is not proof that a tool is callable, and the CLI cannot infer host/session access. Browser verification is the first-class V1 use case, while non-browser behavior uses its existing project/host execution boundary. Do not turn runtime constraints into a step-by-step execution script or propose dedicated runtime adapters without demonstrated need.

### Optional Ponytail Solution Challenge

Before finalizing the proposed implementation approach, complete the relevant
repository investigation and identify the existing mechanisms and constraints
that could satisfy the approved outcome. Consider a Ponytail challenge only
when the proposal contains meaningful complexity that could plausibly be
unnecessary and the active host exposes a callable Ponytail skill that can be
safely scoped to this Plan stage. Do not infer callability from Copilot CLI
availability, plugin installation, instruction-only rules, or a repository
file. Do not switch or persist a session-wide Ponytail mode just to run this
stage's challenge. If a safe, stage-scoped invocation is unavailable, fall back
to Better Spec Kit's built-in challenge and do not claim Ponytail ran.

Ask whether existing mechanisms can be extended and whether each material
proposed abstraction, wrapper, dependency, service, model, state mechanism,
infrastructure change, or future-facing extension is needed for this outcome.
Use implementation shape and repository evidence to decide whether a challenge
is useful; do not use arbitrary numeric thresholds or optimize for fewer files
or lines.

Approved requirements, explicit user decisions, constraints, and selected
Design remain authoritative. Ponytail's recommendations are evidence, not
architecture authority. Plan owns the final decision: adopt a simpler approach
only when it completely satisfies the approved outcome; retain necessary
complexity with brief evidence when simplification would fail a requirement or
constraint. Do not create a separate Ponytail findings artifact or approval
ledger. Bounded research does not delegate feature-wide challenge authority;
the parent Plan stage evaluates the evidence and decides.

### Initial Architecture Baseline

During a project's initial architectural planning, establish and approve the initial project-specific baseline within this existing Plan workflow. Do not add a separate architecture stage or command.

- Ground the recommendation in the project purpose, requirements, known technology choices, relevant constraints, and expected complexity using available repository evidence. For an existing project, inspect relevant existing architecture references, decision records, project rules, and representative repository structure before recommending changes.
- If information that materially affects the recommendation is missing, identify what is missing and why it matters. Do not present unsupported choices as settled.
- If one clear architecture authority exists, keep that existing authority as the source of truth and reference it rather than create a competing architecture document. If architecture sources conflict, stop and ask the user to identify the authority before treating a baseline as approved.
- If no clear authority exists, draft a project-specific reference using the repository's established documentation convention. Use `docs/architecture.md` only when appropriate; do not impose it universally.
- When applicable and supported by evidence, record project context and requirements, baseline status, architecture approach and rationale, high-level structure, major responsibilities, dependency boundaries and permitted directions, file-placement and naming conventions, testing conventions, feature-introduction guidance, justified exceptions, evidence sources, assumptions, and unresolved limitations.
- Distinguish observed current structure from proposed recommendations and approved policy. Mark a newly drafted baseline **Proposed** and ask the user to explicitly approve it. If the user requests changes, revise and present the proposal again. Do not report an unapproved baseline as authoritative or established until the user explicitly approves it.
- Propose changes to an existing architecture authority and require the user to explicitly approve changes before applying them. Do not move, rename, or rewrite application source files or directories while establishing the baseline.
- Never include credentials, secrets, or sensitive values in architecture documentation.
- This guidance covers initial baseline creation only. Keep subsequent feature-workflow maintenance and automated structural validation in their existing downstream workflow responsibilities.

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - If `design.md` exists, incorporate its UI/UX requirements and component reuse decisions into the implementation plan
   - Ensure technical architecture supports the documented desktop and mobile workflows rather than redefining them
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Re-evaluate Constitution Check post-design, including consistency with `design.md` where present

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion to the user.**

Check if `.specify/extensions.yml` exists in the project root.

- If it does not exist, or no hooks are registered under `hooks.after_plan`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_plan` key.
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that `.specify/extensions.yml` could not be read (include the parser error) and that no hooks were checked, including any mandatory (`optional: false`) hooks registered there, then continue to the Completion Report.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Mandatory hook** (`optional: false`) — **You MUST emit `EXECUTE_COMMAND:` for each mandatory hook**:

    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```

    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.

  - **Optional hook** (`optional: true`):

    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

## Completion Report

Command ends after Phase 1 design. Report branch, IMPL_PLAN path, and generated artifacts. After successful planning, recommend `/speckit-tasks` and explain that Tasks turns the approved approach into implementation-ready work. Do not recommend Tasks if a planning gate or required clarification remains unresolved.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Define interface contracts** (if project has external interfaces) → `/contracts/`:
   - Identify what interfaces the project exposes to users or other systems
   - Document the contract format appropriate for the project type
   - Examples: public APIs for libraries, command schemas for CLI tools, endpoints for web services, grammars for parsers, UI contracts for applications
   - Skip if project is purely internal (build scripts, one-off tools, etc.)

3. **Create quickstart validation guide** → `quickstart.md`:
   - Document runnable validation scenarios that prove the feature works end-to-end
   - Include prerequisites, setup commands, test/run commands, and expected outcomes
   - Use links or references to contracts and data model details instead of duplicating them
   - Do not include full implementation code, model/service/controller bodies, migrations, or complete test suites
   - Keep this artifact as a validation/run guide; implementation details belong in `tasks.md` and the implementation phase

**Output**: data-model.md, /contracts/\*, quickstart.md

## Key rules

- Use absolute paths for filesystem operations; use project-relative paths for references in documentation
- ERROR on gate failures or unresolved clarifications
- When `design.md` exists, planning MUST preserve its material UI/UX decisions unless a documented technical or constitutional conflict requires the design to be revised
- Implementation convenience alone is NOT sufficient justification for overriding a documented UI/UX decision

## Done When

- [ ] Plan workflow executed and design artifacts generated
- [ ] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above
- [ ] Completion reported to user with branch, plan path, and generated artifacts
