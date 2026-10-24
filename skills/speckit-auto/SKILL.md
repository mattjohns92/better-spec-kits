---
name: speckit-auto
description: Advance one selected Better Spec Kit work item through deterministic authoritative workflow stages in VS Code Copilot Chat, preserving every existing human decision, approval, quality gate, and stop boundary.
argument-hint: "[stop|status]"
---

## User Input

```text
$ARGUMENTS
```

Treat no argument as enable/resume. Supported arguments are `stop` and `status`. Do not interpret any other argument as a route expression, stage selection, approval, or skip request.

Expected Copilot Chat command forms are `/speckit-auto`, `/speckit-auto stop`, and `/speckit-auto status`; verify the alias in the active VS Code Copilot Chat installation before claiming it is registered.

## Purpose and Limits

Auto changes workflow progression, not workflow behavior. Existing authoritative stages own their instructions, artifacts, questions, decisions, findings, validation, and outcomes. Auto selects and advances one work item only when the next transition is deterministic and supported by the active host.

V1 support is limited to VS Code Copilot Chat. The expected registered skill alias is `/speckit-auto`; verify it in the active environment. Do not claim the conceptual dotted spelling `/speckit.auto` is registered unless runtime evidence proves it.

Auto is not a background job. Hooks do not invoke workflow stages. A successful hook continuation only gives the active agent another turn; Auto must then use the owning stage's installed instructions. If actual stage composition, user-answer resumption, or a command alias is unavailable or unverified, stop and report the exact manual action. Never claim a stage ran when it was only recommended.

## Resolve One Work Item

1. For an explicit scope ID, resolve it exactly to the unique Scope record and recorded feature directory. For an explicit feature directory, verify it exists and contains the expected feature artifacts. Do not resolve by title, recency, branch name, partial ID, or directory order.
2. With no target, use the current conversation's explicit work item or `.specify/feature.json` only when it identifies one unique feature. For Quick or Bug work, require the exact Q/B handoff or current explicit user context and preserve upstream ownership.
3. If there are multiple plausible work items, missing records, mismatched paths, or conflicting artifact state, ask the user to select or resolve the ambiguity before starting work.
4. An Initiative is not an executable batch. Auto may advance only one separately selected child Feature; it must not start siblings.

## Control State

Use `.specify/auto-mode.json` only for control state that cannot be derived: version, Auto state, selected work boundary, optional Copilot session ID, and a concise reason for waiting/stopping/blocking. Do not store stage cursors, findings, evidence snapshots, task history, prompts, answers, credentials, or a second workflow ledger.

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

Persist control state only for an accepted hook-driven continuation path. If supported-agent acceptance has not verified that path, do not promise persistence or unattended progression. Use the approved manual continuation fallback and report the limitation.

## `status`

`status` is read-only. Read the control record if present and inspect only the selected work item's status-bearing artifacts needed to report current or last evidenced stage/result and next action. Do not invoke a stage or update control state.

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

1. Resolve one work item and inspect the current repository state. A stopped run resumes by deriving the next stage from authoritative artifacts; never use a stored stage cursor.
2. Set Auto `ON` only for that item when the host path is available. Do not claim a hook or stage is callable merely because it is installed or discoverable.
3. Derive the current stage and next action from current artifacts and the normal adaptive workflow in `docs/workflow.md`. Inspect the selected work's stage outputs. Do not hard-code a fixed lifecycle sequence.
4. Before a stage transition, identify and load that stage's currently installed authoritative instructions from `.github/skills/`; for upstream stages, use the installed upstream instruction. Follow those instructions for this stage. Same-session instruction composition is not a nested command invocation. If the instructions cannot be found or followed, stop and state the manual next action.
5. Use the host's actual direct skill invocation only when it is demonstrably available. Otherwise continue solely by following the loaded authoritative stage instructions within the current agent turn. Never copy complete stage instructions into this skill or replace a stage with a summary of it.
6. After each stage, inspect its actual output and the changed authoritative artifacts. Only continue when the result establishes the same deterministic next action that Manual Mode would recommend and the active host can safely continue.
7. If an authoritative stage requires a material decision, approval, clarification, design selection, implementation judgment, or hard checkpoint, do no dependent work. Preserve the owning stage's question verbatim where possible. Set `WAITING_FOR_USER` only if the active host can reliably resume; otherwise set `STOPPED` and give the manual continuation. Silence is never approval.
8. If a user answers in a later turn, let the stage that owns the question consume the answer. Resume only when the Auto skill and selected work context are present and supported-agent acceptance has verified that behavior. Otherwise stop safely, do not claim Auto remains active across that boundary, and explain the required manual action.
9. If the user requests stop, honor `STOP_REQUESTED` at the next safe boundary. Do not start a subsequent stage.

## Authoritative Adaptive Routes

Follow the current evidence and owning stage, not a predetermined list:

- **Feature**: preserve optional Design/Preview and context-sensitive Analyze PASS/FINDINGS/INCOMPLETE outcomes.
- **Analyze FINDINGS**: follow Analyze's remediation stage through Remediate, then use a fresh Analyze result. Auto never resolves an Analyze finding.
- **Analyze INCOMPLETE**: stop for the missing prerequisite/evidence; do not implement.
- **Converge gaps**: follow the established Implement -> Converge loop. Proceed to Review only when current Converge evidence establishes convergence.
- **Review blocking findings**: follow Implement -> Converge -> Review. Review alone owns finding status and resolution.
- **Quick**: follow the existing Quick Understand -> Implement -> Validate workflow without creating Feature artifacts.
- **Bug**: hand off only to the supported upstream Bug workflow; never duplicate or claim its behavior without runtime proof.
- **Initiative**: stop at the selected child Feature boundary; do not select or start another child.
- **Review PASS / Summary**: invoke or compose Summary only if supported-agent acceptance demonstrates it. Otherwise report the manual Summary action and do not claim final completion.

When artifacts conflict, are stale, or do not establish a unique next stage, stop and ask for the minimum human decision or report the manual next action.

## Non-Progressing Remediation

Assess progress only after a complete authoritative remediation cycle. Compare the prior and current authoritative results available in this Auto run: stable OPEN finding IDs, core issue/evidence, severity, blocking flag, remediation route, and relevant stage/implementation artifacts. A materially changed result or resolved finding can indicate progress. The same blocking findings with materially unchanged evidence and no relevant artifact progress is a non-progressing loop: set `BLOCKED`, stop automatic continuation, and report the IDs and unchanged evidence.

Do not invent a universal attempt limit, compare hashes/timestamps as a proxy for meaningful progress, persist a cycle ledger, pass finding snapshots to the hook, or change Analyze/Review finding state. If the prior cycle is not available or comparison is ambiguous, stop as `BLOCKED` and ask for human intervention rather than guessing.

## Hook Boundary

- The hook may continue an agent turn only when Auto is explicitly ON for the matching work/session. It may not choose a stage, inspect or compare finding snapshots, approve a tool, or decide whether evidence constitutes progress.
- The hook must allow the turn to end for OFF, WAITING FOR USER, STOP REQUESTED, BLOCKED, STOPPED, DONE, mismatched session, malformed state, hook failure, or a host continuation guard.
- `sessionStart` can add context only; it must not start work without a user turn.
- Do not claim automatic progression, same-session answer resume, safe-stop behavior, or unattended execution unless the corresponding VS Code Copilot Chat acceptance scenario in `specs/024-auto-mode-workflow-progression/quickstart.md` passed.

## Completion

When the selected item reaches its existing successful completion boundary, report DONE and turn Auto off. Do not begin another stage or start another item. Report what stages actually ran, their observed results, the selected boundary, and any runtime limitation. Never claim final completion when required Review, Summary, validation, or acceptance is missing.
