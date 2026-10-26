# Workflow

The recommended Better Spec Kit workflow is:

`specify → clarify → design → plan → tasks → analyze → implement → converge → review`

Analyze is the normal final pre-implementation gate. It checks that applicable artifacts form coherent instructions and challenges whether material decisions are justified and proportionate. It writes findings to the active feature's `analysis.md` and does not modify upstream artifacts. When blocking findings remain, use their remediation stages and rerun Analyze before implementation normally proceeds. Straightforward features should pass quickly without invented findings.

## Project Status

The independent `/speckit.status` skill gives a read-only project-level overview from existing Feature Briefs, Initiative maps, and lifecycle artifacts. It prioritizes attention, reports evidence and uncertainty, and recommends a next action without invoking it or changing project state. This is separate from `better-spec-kit status`, which reports installation and integration diagnostics.

## Project Query

The independent `/speckit.query <question>` utility answers a specific natural-language question by inspecting current project evidence. It responds in chat without changing project state. Query is question-focused; Project Status remains the lifecycle-focused overview of feature and Initiative progress.

## Auto Mode

The optional `/speckit-auto` skill advances one selected work item when the existing workflow makes the next stage deterministic. Use `/speckit-auto status` for a read-only state report and `/speckit-auto stop` to halt automatic progression at a safe stage boundary. It preserves the adaptive Feature, Quick, and upstream Bug routes, all existing approval checkpoints, and the selected work boundary.

One activation covers every applicable lifecycle stage, not one command at a time. For a Feature, Auto continues through implementation, convergence, a current successful Review, and a written Summary before reporting DONE. Stage reports and next-command recommendations return control to Auto, which executes the next action. Auto uses continuous implementation unless the user explicitly chose incremental checkpoints. A genuine question pauses the workflow; once answered in the same conversation with clear work context, Auto resumes without another activation. Recoverable agent-actionable errors remain work for the agent, not routine human handoffs.

V1 targets VS Code Copilot Chat. Copilot hooks can request another agent turn but do not dispatch Better Spec Kit stages; installation or skill discovery does not prove orchestration or answer resumption. Auto must report unsupported transitions and give the exact manual next action. It never infers approval or claims that an authoritative stage ran without runtime evidence.

## Optional Graphify Repository Intelligence

Graphify is optional. When it is already available through the active agent surface and a relevant graph can reduce discovery, existing stages may query it to locate likely code, dependencies, consumers, or related UI. Graph evidence is a map, not proof: source code and runtime behavior remain authoritative, and graph discovery does not create requirements or expand approved scope. If Graphify or useful graph evidence is unavailable, unsupported, stale, or failing, fall back to existing repository investigation and state limitations when relevant. Do not use a CLI availability check as proof of agent access or graph currentness.

Graph use is proportional. Scope, Specify, Clarify, Design, Plan, Analyze, Implement, and Review may benefit; Tasks, Preview, Converge, and Summary should not repeat discovery that authoritative upstream artifacts already provide. Graphify remains external and optional. Better Spec Kit does not install it, require Cloud, or maintain a second graph or freshness store.

Implementation can make a graph stale. Do not refresh it at every stage or intermediate checkpoint. When Review will rely on a local graph after source changes, use Graphify's documented update behavior at the final implementation or remediation boundary. If the active Graphify surface cannot establish currentness, Review falls back to source inspection and must not call the graph current. After Review passes, an unchanged graph may be reused by the next feature.

## Optional Scope and Quick entry

Use `/speckit.scope <request>` when you want help choosing a proportionate path. Scope inspects relevant project evidence first, then routes work as BUG, QUICK, FEATURE, or INITIATIVE according to whether further specification would materially reduce uncertainty about the intended outcome or its important boundaries. It reassesses after relevant evidence and each user answer; implementation breadth or effort alone does not require FEATURE. Scope remains optional; direct expert entry is supported.

Scope writes sanitized, ID-addressable handoffs under `specs/.scope/` for Bug, Quick, and Initiative records. A Feature Brief lives in its normal numbered feature directory. Quick continues a contained handoff through Understand → Implement → Validate: it investigates relevant source, callers, patterns, tests, and regression boundaries; waits for a clear answer to a bounded consequential question; and preserves evidence when broader product, architecture, persistence, permission, or cross-cutting decisions need an owner. Quick is suitable for substantial implementation when the outcome and boundaries are understood.

Scope classifies mixed requests item by item. It can create separate Quick handoffs and recommend one invocation with their exact Q IDs, while Feature and Bug items keep their existing routes. Quick preserves per-item boundaries, sequences dependent work, parallelizes only independent items when allowed, and performs parent-owned integrated validation for the grouped execution.

Feature Brief creation and Specify's fresh-session ID resolution are separate behaviors. Do not claim `/speckit.specify F###` consumed a brief unless that receiver behavior has passed its supported-agent acceptance check. Likewise, provisioning Bug does not prove a fresh session can pass a `B###` handoff to Bug Assess.

## Analyze outcomes

- When Analyze returns **PASS**, follow its context-sensitive next-step recommendation. It may recommend `/speckit.preview` when a human-readable overview would materially improve understanding, or `/speckit-implement` directly for straightforward proposals. Preview remains optional.
- When Analyze returns **FINDINGS** with OPEN blocking findings, run `/speckit.remediate`, then run Analyze again. Do not implement while blocking findings remain.
- When Analyze returns **INCOMPLETE ANALYSIS**, obtain the missing evidence or prerequisite; do not recommend implementation yet.

After Analyze passes, continue through Implement, Converge, and Review. Remediate coordinates only pre-implementation upstream changes; Analyze independently reassesses them.

## Design

Uses a pattern-first approach: inspect the existing application, reuse established patterns for routine changes, and avoid manufacturing alternatives. When materially different visual approaches would help the user's decision, present visual alternatives before selecting a direction and render disposable concepts when practical with tools available in the current session. The user can select, combine, revise, or reject them. If rendering is unavailable or impractical, explain the limitation and provide a useful non-rendered representation. Do not proceed while a material choice is pending.

## Plan

Classifies UI impact as NONE, MINOR, or SIGNIFICANT and uses `design.md` as the selected/current direction. Plan must wait while a material design choice is pending; it does not resolve the choice or promote abandoned alternatives into requirements. It otherwise discovers the project's actual technology, architecture, conventions, dependencies, and relevant implementation before choosing an approach, favouring the smallest maintainable solution that preserves the approved specification and design.

When a user approves a visual Design, it remains the implementation target
through the existing workflow. Plan and Tasks keep concise traceability to its
material decisions; Analyze checks for omissions before implementation; Preview
explains the approved target without creating a new decision. Implement compares
significant UI work with the approved reference when both can be inspected
using current host capabilities, and reports the evidence and limitations
without claiming unobserved fidelity. GitHub Spec Kit owns Converge; Review
independently assesses material Design compliance, and Summary reports only
fidelity evidence actually obtained.

## Tasks

Creates the original implementation plan in the feature's `tasks.md` while preferring reuse and extension over unnecessary new files, dependencies, abstractions, or infrastructure. That file remains the single implementation work ledger: upstream Converge may append missing completeness work, Implement may append Review-remediation tasks under `## Review Remediation`, and Review reads the ledger without modifying it. Review findings remain in `review.md` and are never replaced by task status.

## Analyze (Normal Gate)

Checks applicable requirements, clarification decisions, design, plan, tasks, constitution, and relevant project conventions before implementation. The enhanced `/speckit.analyze` skill preserves useful upstream consistency checks and adds evidence-based decision challenge. Its durable `analysis.md` records stable findings, blocking status, and the earliest authoritative remediation stage. Analyze may write only that artifact; it does not remediate findings or replace Implement, Converge, or Review.

## Implement

Re-inspects relevant code before each task, preserves authoritative design decisions, implements the smallest maintainable change, and validates behavior.

Adaptive execution happens inside Implement. It may use continuous work for cohesive changes or meaningful increments with focused validation and concise checkpoints that pause for the user's response; checkpoints do not replace feature-level Converge, Review, or Summary.

## Converge (Upstream)

GitHub Spec Kit owns `/speckit.converge`; Better Spec Kit does not duplicate, bundle, or replace it. Run Converge after implementation. If it appends remaining tasks, repeat `converge → implement → converge` until no work remains. If Converge is unavailable, follow the [official GitHub Spec Kit installation and update instructions](https://github.com/github/spec-kit); do not install an unverified replacement.

## Review

Runs after convergence as an independent, read-only implementation-quality gate. It assesses correctness and regression risk, applicable design compliance, test quality, and simplicity/reuse/maintainability. It uses current Converge evidence without repeating exhaustive completeness analysis, but checks relevant requirements when evidence is missing or contradicted. It creates or updates a durable `review.md` artifact in the active feature directory, records blocking and non-blocking findings with stable IDs, and keeps a concise resolved-history without merging findings into `tasks.md`. It reports evidence-backed findings and a clear completion outcome; it does not fix files and it remains the only authority for changing a finding from `OPEN` to `RESOLVED`. Task completion alone does not resolve findings. After remediation, the expected sequence is `implement -> converge -> review`.

## Summary

Summary is available at any workflow stage as a descriptive as-of account. Review `PASS` is required only for final completion or acceptance claims. When Review is missing, stale, incomplete, non-PASS, or has blocking findings, Summary still describes the current state and labels Review status; it does not claim completion. After Review returns a current `PASS`, invoke `/speckit-summary <feature-directory>` as the explicit manual final-completion handoff, or let an active Auto workflow execute the installed Summary instructions before completion. Summary creates or updates a feature-local `summary.md` from delivered implementation and available evidence; it does not replace Review or authoritative requirements. Copilot skill discovery does not guarantee automatic skill-to-skill invocation, so Review must not claim Summary ran unless it actually ran.
