---
name: speckit-auto
description: Advance one selected Better Spec Kit work item through deterministic authoritative workflow stages in VS Code Copilot Chat, preserving every existing human decision, approval, quality gate, and stop boundary.
argument-hint: "[pre-implement|stop|status]"
---

## User Input

```text
$ARGUMENTS
```

Treat no argument as full Auto enable/resume. Supported arguments are `pre-implement`, `stop`, and `status`. Do not interpret any other argument as a route expression, stage selection, approval, or skip request.

Expected Copilot Chat command forms are `/speckit-auto`, `/speckit-auto pre-implement`, `/speckit-auto stop`, and `/speckit-auto status`; verify the alias in the active VS Code Copilot Chat installation before claiming it is registered.

## Purpose and Limits

Auto changes workflow progression, not workflow behavior. Existing authoritative stages own their instructions, artifacts, questions, decisions, findings, validation, and outcomes. Auto selects and advances one work item only when the next transition is deterministic and supported by the active host.

V1 support is limited to VS Code Copilot Chat. The expected registered skill alias is `/speckit-auto`; verify it in the active environment. Do not claim the conceptual dotted spelling `/speckit.auto` is registered unless runtime evidence proves it.

Auto is not a background job. Hooks do not invoke workflow stages. A successful hook continuation only gives the active agent another turn; Auto must then use the owning stage's installed instructions. An unavailable or unverified command alias does not block same-turn instruction composition. Stop only when the owning stage's instructions cannot be found or followed, or when a real human or host boundary requires it. Never claim a stage ran when it was only recommended.

## Execution Contract

One `/speckit-auto` request authorizes execution of successive deterministic stages for the selected work item, not just selection or recommendation of one stage. Keep Auto as the outer workflow while following each owning stage's instructions.

`pre-implement` selects preparation-only mode for the current request. It follows applicable preparation until derived readiness, then ends successfully without entering source-changing implementation. Do not persist the mode, a readiness flag, a stage cursor, or an implementation-availability wait.

This caller contract applies to every applicable lifecycle skill, including installed upstream stages: Specify, Clarify, Design, Plan, Tasks, Analyze, Remediate, optional Preview, Implement, Converge, Review, and Summary. It is not limited to an Analyze/remediation pair. Follow the owning stage's context-sensitive route; do not run optional stages merely to exhaust this list or invoke unrelated utilities.

For a Feature, the selected completion boundary is delivered and validated implementation, successful convergence, a current Review PASS with no OPEN blocking findings, and a written current Summary. Finishing the specification, tasks, implementation, or Review alone is not DONE. After Review PASS, execute Summary before reporting completion.

For `pre-implement`, the selected completion boundary is current `READY TO IMPLEMENT` evidence. This successful boundary ends the Auto request before Implement; it is not full Feature completion.

Repeat within the current turn: derive the next action, load its authoritative instructions, execute the stage, validate its result, then return control to Auto and derive the next action again. A stage's completion report is an intermediate result, not the end of the Auto request. Send concise progress updates between stages; do not end the turn with "Next: run ..." when that action can be executed now. Do not require another `/speckit-auto` request at every stage boundary.

Standalone-stage instructions to recommend the next command, return to the user, or not automatically launch another stage preserve that stage's ownership; they do not terminate the outer Auto workflow. The stage finishes before Auto executes the next stage. This does not bypass any material decision, approval, quality gate, or hard checkpoint.

For example, after Tasks completes and establishes Analyze as next, execute Analyze. If Analyze reports OPEN blocking findings, execute Remediate for those findings; after actual remediation and any required downstream reconciliation, execute a fresh Analyze. Do not rerun Analyze against unchanged artifacts instead of executing Remediate. Assess non-progress only after a complete remediation cycle, not merely because findings are still OPEN before remediation.

End the Auto request only at the selected completion boundary, an explicit stop request, a genuine human decision/approval, a concrete missing prerequisite or execution failure, a non-progressing remediation cycle, or an actual host limit that prevents further execution. Report the specific reason when stopping; a routine next-stage recommendation is not a stop reason.

Resolve recoverable execution errors and obtain missing evidence yourself when safe and within the approved boundary. An agent-actionable failure or prerequisite is work to perform, not automatically a request for human intervention. Never bypass required permissions, invent evidence, or loop indefinitely on an unrecoverable failure.

## Resolve One Work Item

1. An exact target in the current invocation takes precedence over conversation context and repository metadata. For an explicit Feature ID, resolve it exactly to the unique Scope record and recorded feature directory. Resolve Quick work from an exact Q ID to exactly one new Q Brief or legacy `.scope` handoff, associating any supplemental Q folder only by the recorded ID and slug. Ambiguous or conflicting records stop for clarification. For an explicit feature directory, verify it exists and contains the expected feature artifacts. Do not resolve by title, recency, branch name, partial ID, or directory order.
2. Without an invocation target, continue only the current conversation's explicit work item when it identifies one exact item. Never use `.specify/feature.json` as session identity or to override that selection; it is shared repository state. For Quick or Bug work, require the exact Q/B handoff or current explicit user context and preserve upstream ownership.
3. If there are multiple plausible work items, missing records, mismatched paths, or conflicting artifact state, ask the user to select or resolve the ambiguity before starting work.
4. An Initiative is not an executable batch. Auto may advance only one separately selected child Feature; it must not start siblings.

## Control State

Use `.specify/auto-mode.json` only for control state that cannot be derived: version, Auto state, selected work boundary, optional Copilot session ID, and a concise reason for waiting/stopping/blocking. Do not store stage cursors, findings, evidence snapshots, task history, prompts, answers, credentials, or a second workflow ledger.

Do not store the `pre-implement` mode or derived readiness. When full Auto stops because implementation availability is held, unknown, or unverifiable, it must not retain an automatic waiting run; a fresh explicit Auto request is required after availability changes.

The hook handler at `.github/hooks/speckit-auto.mjs` owns validated JSON parsing and turn-gating decisions. When this skill creates or changes the record, preserve the schema:

```json
{
  "version": 1,
  "state": "ON",
  "workItem": {
    "type": "feature",
    "directory": "specs/NNN-feature-slug"
  },
  "sessionId": null
}
```

A Quick work item uses `{ "type": "quick", "id": "Q###" }`; an upstream Bug work item uses `{ "type": "bug", "id": "B###" }`. Use only exact repository records. Missing or invalid records fail safe to OFF/manual operation; do not repair them by guessing.

Persist control state only for an accepted hook-driven continuation path. If supported-agent acceptance has not verified that path, do not promise persistence or unattended progression; continue deterministic stages within the current turn and report the limitation only when continuation across a turn boundary is needed. A missing control record means `OFF`, not `STOPPED`.

## `status`

`status` is read-only. Read the control record if present and inspect only the selected work item's status-bearing artifacts needed to report current or last evidenced stage/result and next action. If the control record is absent, report `OFF`; absence alone is not a stopped run or a reason to halt same-turn work. Do not invoke a stage or update control state.

Report concise labeled lines, state first:

```text
AUTO STATUS
State: ON | WAITING FOR USER | STOP REQUESTED | BLOCKED | STOPPED | DONE | FAILED | OFF | UNKNOWN
Work: <one selected item, or unknown>
Stage: <current/last evidenced stage, or unknown>
Result: <last authoritative result, or unknown>
Next: <one evidenced next stage/action, or undetermined>
Reason: <blocker or host limitation, when applicable>
```

Omit unavailable details or label them `UNKNOWN`; never infer ON from a stale chat transcript, artifact existence alone, or a prior completion claim. `FAILED` describes an observed current-run failure, not a persisted control state; report the authoritative failure and manual recovery action. Status never changes state.

## `stop`

On `stop`, record `STOP_REQUESTED` for the selected Auto run. Do not interrupt an in-progress repository mutation or skip its required validation. At the next safe workflow boundary, change state to `STOPPED`, do not begin another stage, and report the exact manual continuation. If no bounded stage is in progress, stop immediately. If the host cannot deliver a stop request until a turn boundary, state that limitation.

## Enable or Resume

1. Resolve one work item and inspect the current repository state. A stopped run resumes by deriving the next stage from authoritative artifacts; never use a stored stage cursor. If the current request is `pre-implement`, keep that boundary for this request only.
2. When hook-driven continuation is verified, set Auto `ON` for that item and persist the control record. Otherwise keep the run current-turn only; do not claim persisted or unattended Auto state. Do not claim a hook or stage is callable merely because it is installed or discoverable.
3. Derive the current stage and next action from current artifacts and the normal adaptive workflow. Use `docs/workflow.md` when present; its absence is not a blocker. Inspect the selected work's stage outputs and installed stage instructions. Do not hard-code a fixed lifecycle sequence.
4. Before a stage transition, identify and load that stage's currently installed authoritative instructions from `.github/skills/`; for upstream stages, use the installed upstream instruction. Follow those instructions for this stage. Same-turn instruction composition does not require a registered alias or nested command invocation. If the instructions cannot be found or followed, stop and state the manual next action.
5. Use the host's actual direct skill invocation only when it is demonstrably available. Otherwise continue by following the loaded authoritative stage instructions within the current agent turn. Never copy complete stage instructions into this skill or replace a stage with a summary of it.
6. After each stage, inspect its actual output and the changed authoritative artifacts. When the result establishes the same deterministic next action that Manual Mode would recommend and the active host can safely continue, execute that action now and repeat the loop. Do not merely report it as a manual next step.
7. If an authoritative stage requires a material decision, approval, clarification, design selection, implementation judgment, or hard checkpoint, do no dependent work. Preserve the owning stage's question verbatim where possible. Keep the selected Auto intent waiting for the answer as `WAITING_FOR_USER`; persist it only through an accepted control-state path. Silence is never approval. A question pauses the workflow, not the user's Auto preference.
8. When the user answers in the same conversation and the selected work and pending question are unambiguous, let the owning stage consume the answer, then resume the Auto loop without requiring another `/speckit-auto` command. If context is missing or ambiguous, ask only for the missing context; do not guess or claim unattended cross-session resumption. For unsupported host-driven resumption, do not claim Auto remains active across that boundary without retained context.
9. If the user requests stop, honor `STOP_REQUESTED` at the next safe boundary. Do not start a subsequent stage.

## Authoritative Adaptive Routes

**Approved Design fidelity**: Auto must not select or approve a material Design. After user approval, it may continue deterministic corrections toward the approved target. Pause if correction would require changing the approved Design, and wait for the user's decision.

Follow the current evidence and owning stage, not a predetermined list:

- **Feature pre-implementation**: For `pre-implement`, derive the applicable preparation route from current artifacts and owning-stage recommendations. Continue through applicable Specify, Clarify, Design, Plan, Tasks, Analyze, and blocking-finding Remediate behavior. Require F021's current Feature readiness evidence, including a current Analyze PASS without blocking findings; preserve optional Design and Preview semantics, and absence of Preview alone does not prevent readiness. At `READY TO IMPLEMENT`, report successful preparation and stop before Implement. Never enter Converge, Review, or Summary in this mode. If implementation has already begun, report the evidenced current stage and stop without changing or restarting it.
- **Feature**: continue through applicable Specify, Clarify, Design, Plan, Tasks, Analyze, Implement, Converge, Review, and Summary behavior. Preserve optional Design/Preview and context-sensitive Analyze PASS/FINDINGS/INCOMPLETE outcomes. Load each stage's installed instructions; this list is coverage, not a fixed lifecycle sequence.
- **Analyze FINDINGS**: follow Analyze's remediation stage through Remediate, then use a fresh Analyze result. Auto never resolves an Analyze finding.
- **Analyze INCOMPLETE**: obtain the missing prerequisite/evidence when safely agent-actionable, then rerun Analyze. Ask the user only for evidence, access, or a decision the agent cannot supply; do not implement before this gate passes.
- **Converge gaps**: follow the established Implement -> Converge loop. Proceed to Review only when current Converge evidence establishes convergence.
- **Feature Review blocking findings**: follow Implement -> Converge -> Review. Review alone owns finding status and resolution.
- **Quick Review findings**: Quick findings return through Quick implementation, validation, and Review for the same selected Q item. Do not add Feature Converge or change Review-owned finding status.
- **Assisted authentication**: inspect existing project/browser mechanisms and explain the required non-production identity/role. BSK may guide the user through providing or creating an external identity, but must not itself create or provision one. Pause for explicit approval before setup changes, credential-dependent steps, or state capture. When approved and callable, the user enters credentials directly; manual login followed by locally persisted browser state may be used only after version-control exclusion is verified. Otherwise report authentication as unavailable.
- **Quick**: resolve Quick work from the exact Q ID and follow its authoritative Brief -> Design when UI applies -> Quick implementation -> validation -> Review route without creating Feature artifacts. Quick retains its Understand -> Implement -> Validate execution loop inside this route. Wait for explicit user approval of the current Design before UI implementation. After Quick Review PASS, complete that Q item without Summary or Converge. If Quick Review has completion-blocking findings, return through Quick implementation, validation, and Review; Review alone owns finding status.
- **Quick pre-implementation**: In `pre-implement` mode, follow the exact Q Brief and applicable decision/Design route only. A non-visual QUICK may be ready without Feature-only artifacts; a UI QUICK is not ready until its current Design is explicitly approved. Stop at F021 readiness without entering Quick implementation, validation, or Review.
- **Bug**: Follow the supported upstream Bug workflow and preserve Bug Assess/Fix/Test ownership. Only when supplied reproduction steps and a non-production target are safe and accessible, attempt the pre-fix reproduction and pass the observed result and relevant environment limitations to upstream Bug Assess as input. Do not modify or replace upstream Bug artifacts or commands. If target access, authentication, or side-effect safety is missing, do not guess or bypass it; pause for required user input or report the reproduction as not run with its reason. After the upstream fix, upstream Bug Test owns the same reproduction after the fix; never claim either observation unless it actually ran.
- **Initiative**: stop at the selected child Feature boundary; do not select or start another child.
- **Feature Review PASS / Summary**: after Feature Review PASS, load and execute Summary using the same instruction-composition path as every other stage. Do not stop at a manual Summary recommendation or require separate dispatch acceptance for same-turn composition. A Quick Review PASS completes the selected Q item after Auto verifies current implementation/validation and no OPEN blocking findings; do not invoke Summary or Converge for Quick. If Review is not PASS, continue its applicable remediation or evidence-gathering route; never use Summary to bypass Review.

When artifacts conflict, are stale, or do not establish a unique next stage, stop and ask for the minimum human decision or report the manual next action.

## Shared-Source Ownership

Before Auto starts a source-changing implementation task, load `instructions/shared-source-ownership.instructions.md` and acquire the exact work item's claim immediately before the first source edit. Recheck the token before later source changes; a HELD or UNKNOWN claim blocks that path. Do not serialize verified read-only preparation or item-local artifact work. Keep the token only in the current conversation/terminal context, never in Auto control state or repository artifacts. Retain ownership while source changes, stable-source validation, or known source remediation remains, and release at the first evidenced stable-source boundary without waiting solely for Review PASS or Feature completion. Reacquire before later remediation. Auto never performs explicit recovery without the user's inspection and acceptance, and never bypasses the lock because it is progressing stages automatically.

Full Auto must distinguish readiness from implementation availability. If it reaches readiness and F022 reports ownership as HELD, UNKNOWN, or unverifiable, stop the current run, report that state, and require a fresh explicit `/speckit-auto` invocation after availability changes. Do not wait for release, resume automatically, or start another item. A `pre-implement` run stops at readiness regardless of availability and does not claim or modify source ownership.

## Non-Progressing Remediation

Assess progress only after a complete authoritative remediation cycle. Compare the prior and current authoritative results available in this Auto run: stable OPEN finding IDs, core issue/evidence, severity, blocking flag, remediation route, and relevant stage/implementation artifacts. A materially changed result or resolved finding can indicate progress. The same blocking findings with materially unchanged evidence and no relevant artifact progress is a non-progressing loop: set `BLOCKED`, stop automatic continuation, and report the IDs and unchanged evidence.

Do not invent a universal attempt limit, compare hashes/timestamps as a proxy for meaningful progress, persist a cycle ledger, pass finding snapshots to the hook, or change Analyze/Review finding state. If the prior cycle is not available or comparison is ambiguous, stop as `BLOCKED` and ask for human intervention rather than guessing.

## Hook Boundary

- The hook may continue an agent turn only when Auto is explicitly ON for the matching work/session. It may not choose a stage, inspect or compare finding snapshots, approve a tool, or decide whether evidence constitutes progress.
- The hook must allow the turn to end for OFF, WAITING FOR USER, STOP REQUESTED, BLOCKED, STOPPED, DONE, mismatched session, malformed state, hook failure, or a host continuation guard.
- `sessionStart` can add context only; it must not start work without a user turn.
- The feature acceptance quickstart is a development-only reference, not a consumer-project prerequisite. Do not claim automatic progression, same-session answer resume, safe-stop behavior, or unattended execution unless the corresponding VS Code Copilot Chat acceptance scenario passed.

## Completion

For a Feature, verify successful convergence, current Review PASS, no OPEN blocking findings, required validation/acceptance, and a current written Summary before reporting DONE and turning Auto off. For Quick, stop at the exact Q item's current Review PASS with required Design/validation evidence and no OPEN blocking findings; do not require or generate Feature Summary or Converge. Bug retains its upstream completion boundary. Do not begin another stage or start another item after completion. Report what stages actually ran, their observed results, the selected boundary, and any runtime limitation. Never claim final completion when required Review, validation, or acceptance is missing.
