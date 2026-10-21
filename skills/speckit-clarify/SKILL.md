---
name: speckit-clarify
description: Resolve material feature decisions interactively and record approved answers in the feature specification.
compatibility: Requires an initialized GitHub Spec Kit project.
metadata:
  author: better-spec-kit
  source: Adapted from the installed Spec Kit Clarify workflow; preserves compatible checklist and extension-hook behavior.
---

## User Input

```text
$ARGUMENTS
```

Consider any user-provided focus. Do not let it override the original request, Scope-owned boundaries, an explicit decision, project constraints, or evidenced necessary behavior.

## Purpose

Clarify identifies and resolves material decisions that an agent is not authorized to make for the user. Inspect repository facts first, ask one consequence-aware question at a time, update the authoritative feature spec after each answer, and stop while waiting for a required decision. Planning must not begin while material product or scope decisions remain unresolved.

Clarify does not ask about immaterial details, replace repository investigation, create a new workflow stage, or treat silence, agent preference, best practice, or repetition in artifacts as approval.

## Pre-Execution Hooks

Check `.specify/extensions.yml` for `hooks.before_clarify`. If absent or no hooks are registered, continue silently. Skip hooks explicitly disabled and do not evaluate non-empty conditions. Optional hooks are reported with their command and prompt. Mandatory hooks must be invoked and completed before proceeding. If the YAML is invalid or unreadable, report the error and that hooks were not checked, then continue normally.

## Resolve the Active Feature

1. Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly` once from the repository root and parse `FEATURE_DIR` and `FEATURE_SPEC`.
2. If setup fails or JSON cannot be parsed, stop and ask the user to run `/speckit-specify` or repair the feature context.
3. Read `.specify/memory/constitution.md` when present, then read the active `spec.md` and applicable Scope Feature Brief or other authoritative intent artifacts.
4. If the spec does not exist, direct the user to `/speckit-specify`; do not create a feature here.

## Investigate and Assess Decisions

Inspect enough relevant repository evidence to answer factual questions before asking the user. Distinguish observed behavior from assumptions, recommendations, and user decisions.

Assess the active feature for material ambiguity across:

- user outcomes, explicit boundaries, roles, and acceptance;
- important behavior, data meaning, and lifecycle choices;
- consequential interaction, error, security, compatibility, and operational choices;
- dependencies and constraints;
- unresolved markers or contradictory artifacts.

Do not ask questions merely because a taxonomy category is incomplete. Ask only when an answer could materially change what the user receives, the authorized scope, risk, compatibility, operations, or meaningful implementation breadth. Implementation trivia and facts available in the repository belong to the agent, not the user.

For UI-related decisions, inspect relevant product behavior and established application patterns before asking. Do not ask the user to choose routine visual or interaction details when following an established pattern preserves the requested outcome. Ask only when different answers could materially change required behavior, scope, risk, or implementation breadth. Clarify resolves what behavior is required; Design determines its visual presentation.

For discovered work, distinguish:

- **Necessary consequence**: evidence shows it is needed to correctly and safely deliver approved behavior or preserve required existing behavior. Include it when justified; explain material consequences.
- **Material decision**: multiple valid choices have meaningful consequences and no applicable user decision resolves them. Do not choose silently; ask the user.
- **Optional recommendation**: beneficial but not needed for the approved outcome. Keep it out unless the user explicitly accepts it. Offer add, reject for this feature, or defer where appropriate.

Security, best practice, maintainability, future reuse, and architectural elegance alone do not establish necessity. Prefer existing behavior when it already satisfies the approved outcome.

A requirement's presence in `spec.md` does not establish approval. Trace material requirements to the original request, Scope-owned intent, an explicit clarification or approval, an accepted recommendation, a demonstrated project constraint, or an evidenced necessary consequence. If a material requirement lacks that support, do not treat the specification as ready for planning.

## Ask Interactively

- Ask exactly one coherent question at a time. Do not reveal a queue of future questions.
- Put the complete question on a `**Question:**` line and follow it with one plain-language `Why it matters` sentence.
- When useful, offer distinct options with concise, evidence-based consequences and a recommendation. Do not exaggerate risks or steer through unsupported claims.
- Accept natural-language answers; do not impose a fixed word limit.
- Resolve prerequisite choices first. After an answer, remove questions that only concern an eliminated branch.
- Continue in further turns until all material decisions needed before planning are resolved. Do not impose an arbitrary small total question or marker cap, guess remaining answers to meet a cap, or dump an indiscriminate questionnaire.
- Respect a user's explicit, applicable delegation such as “preserve existing behavior” or “choose the simplest option.” Do not stretch it to materially different trade-offs or use it to weaken explicit requirements or necessary correctness/security.
- If the user asks to stop, record unresolved decisions as unresolved and state that planning is not ready. A missing answer is never approval.

If a recommendation is material, explain its value and impact and ask whether to add it, reject it for the current feature, or defer it. A recommendation becomes approved scope only after explicit acceptance. A rejection applies to the current feature unless the user says otherwise. If the user chooses a deferral, append it to `specs/.scope/deferred-recommendations.md`; deferral is not approval.

Create the record only when a recommendation is explicitly deferred. Use one compact entry with a short title, area, originating feature/context, recommendation, why valuable, why deferred, and an optional `ACTIVE` or `NO LONGER RELEVANT` status. Do not add priorities, estimates, owners, deadlines, schedules, scores, or implementation tasks. When a later user explicitly accepts a deferred item, record that decision in the new feature's authoritative spec; do not rewrite history as though it was always approved.

## Integrate Each Answer

After each accepted answer:

1. Ensure `## Clarifications` exists after the feature's opening context and add `### Session YYYY-MM-DD` if needed.
2. Append exactly one bullet: `- Q: <question> → A: <final answer>`.
3. Update the authoritative requirement, scenario, boundary, entity, or success criterion affected by the answer.
4. Remove rejected alternatives and requirements from branches the answer eliminated. Do not leave contradictory language elsewhere in the spec.
5. Preserve unrelated sections, heading order, and formatting. Write the updated spec immediately after integrating the answer.
6. Re-evaluate the existing `checklists/requirements.md`, if present. Change only checkbox markers whose pass state actually changed; preserve all other text and formatting. Report before/after pass counts, changed items, and any unchecked items.

Do not modify Scope-owned Feature Briefs or Initiative structure. If the user's answer materially changes a Scope-owned boundary, stop and return that boundary change to Scope; only reconcile the feature spec after the authoritative boundary is reassessed.

## Completion and Readiness

When no material decisions remain, report that clarification is complete and the spec is ready for the next applicable stage. When unresolved material decisions remain, identify them and do not recommend planning.

Report:

- questions asked and answered in this session;
- path to the spec and sections changed;
- checklist before/after counts, changed items, and anything still unchecked, when a checklist exists;
- concise coverage summary, marking implementation research better suited to Plan as deferred;
- whether planning is ready and the exact next command.

If no material question is warranted, say: “No critical ambiguities detected worth formal clarification.” Give a concise coverage summary and recommend the next applicable stage only if no material decision remains.

## Post-Execution Hooks

Check `.specify/extensions.yml` for `hooks.after_clarify`. Apply the same hook rules as the pre-execution section. Skip silently when absent; report invalid or unreadable configuration. Invoke and await enabled mandatory hooks before reporting completion.
