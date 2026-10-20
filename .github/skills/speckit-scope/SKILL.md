---
name: speckit-scope
description: Route an ordinary request to a proportionate workflow and create a safe, durable handoff when scope is clear.
compatibility: Requires repository access and GitHub Spec Kit feature artifacts for Feature Briefs.
---

## User Input

```text
$ARGUMENTS
```

Treat the request as the user's intent, not as an approved implementation design. Scope is optional; existing expert workflows remain usable directly.

## Purpose

Entry: `/speckit.scope <ordinary-language request>`.

Inspect enough relevant project evidence to classify work responsibly, ask only for missing scope decisions, and report one safe next action. Scope owns classification, handoff records, Initiative decomposition, and Feature Briefs. It does not replace Specify, Clarify, Design, Plan, Tasks, Bug Assess, or Quick implementation.

## Workflow

1. Inspect the project and relevant feature artifacts before asking questions the repository can answer. Keep inspection proportional. Distinguish observed facts from assumptions and user intent. If `specs/.scope/deferred-recommendations.md` exists, inspect only active entries that repository evidence makes relevant to this request. Present matches as unapproved recommendations and let the user choose whether to reconsider them; never auto-add or dump unrelated entries into the handoff.
2. Ask concise questions only for missing purpose, expected outcome, constraints, or boundaries that affect classification or decomposition. If material scope remains unresolved, report an incomplete result and write no artifact that implies a decision was made.
3. Classify from the nature of the request and available evidence:
   - **BUG**: established behavior is failing or regressed.
   - **QUICK**: a contained change follows an established project pattern and needs no material scope decision.
   - **FEATURE**: one coherent capability needs the normal detailed feature workflow.
   - **INITIATIVE**: evidence supports multiple coherent, independently specifiable outcomes with meaningful boundaries.
4. Explain the evidence and rationale. Do not use arbitrary size proxies such as file count, line count, or duration; technical difficulty alone does not make work an Initiative. Challenge unsupported assumptions and materially inappropriate boundaries.
5. Before any durable write or external handoff, redact credentials and other sensitive values with explicit markers. Preserve all remaining original request text verbatim and separately record Scope's interpretation. Never send unredacted content to Bug Assess.
6. Resolve existing records by exact typed ID. Ask rather than guess when an ID is missing, duplicated, or ambiguous.
7. Write only the record needed for the selected work shape, then report its ID, blockers, and one exact next action.

## Records and Ownership

Allocate stable, non-reused IDs by inspecting existing records of the same type: `B###`, `Q###`, `F###`, and `I###`. Use three-digit numbering beginning at `001` and retain retired IDs as historical references.

- **BUG**: `specs/.scope/B###-<slug>.md`. Record reported behavior, known expected behavior, relevant evidence, boundaries, unresolved assessment questions, and sanitized original request. Report the actual upstream Bug provisioning state. Installation does not prove a fresh session can pass this ID to Assess. Only use the active integration's verified command when the B001 runtime gate in the feature task ledger is complete; otherwise retain the handoff and state that ID consumption is unverified.
- **QUICK**: `specs/.scope/Q###-<slug>.md`. Record the small intended outcome, established pattern, relevant evidence, boundaries, and validation target. Recommend `/speckit.quick Q###` only when that skill is available; never claim it ran.
- **FEATURE**: Create `brief.md` inside the normal sequential `specs/NNN-<slug>/` feature directory. Include the stable `F###` ID, title, original request, intended outcome, boundaries, exclusions, evidence, supported dependencies/consumers, unresolved downstream questions, rationale, and exact `feature_directory` for Specify. For an Initiative child, include `parent_initiative` with the parent ID/path and enough parent context to preserve its boundary. Do not create a detailed specification. Until the F001 runtime gate in the feature task ledger is complete, do not claim that invoking Specify with an ID resolves the brief; retain it and report the receiver limitation.
- **INITIATIVE**: `specs/.scope/I###-<slug>.md` plus child Feature Briefs only for outcomes supported by current evidence. Record purpose, outcomes, boundaries, evidence, child map, evidence-backed dependencies, lightweight status, unresolved questions, and one recommended starting feature with rationale. Keep child status canonical in the parent map. Do not create detailed specifications for future work or start multiple children automatically.

Use YAML front matter with an exact `id` field in every record. Keep original request and interpretation distinct. Never let downstream workflows silently change Scope-owned Initiative structure, IDs, or boundaries; reassess those through Scope when evidence changes.

## Bug Provisioning and Runtime Boundary

Better Spec Kit may provision only the official upstream Bug extension through the native Spec Kit extension manager during standard installation when prerequisites allow. Report provisioning as `provisioned/enabled`, `present-disabled`, `partial`, or `unverified` based on observed state. Never vendor, force-reinstall, enable, or automatically update Bug. Provisioning success and command registration are not proof of fresh-session handoff behavior.

Before recommending Bug-ID consumption, inspect the Feature 007 task ledger and the verified active integration alias. If the B001 runtime check is unchecked, failed, or unavailable, do not invoke or claim Bug Assess received the record. Keep unrelated Scope, Quick, Feature Brief creation, and Initiative work available.

## Reassessment and Escalation

Reassess existing records only against relevant current evidence. Preserve useful history and IDs; allocate new IDs when splitting outcomes. Evolution may include refining, splitting, merging, reordering, renaming, superseding, or removing boundaries when evidence justifies it. Downstream workflows must never change Scope-owned Initiative decomposition silently; they must preserve evidence and return material product, architecture, persistence, permission, or cross-cutting decisions to Scope or the appropriate full workflow.

## Completion Report

State the classification and evidence-based rationale, durable artifact and ID (if any), unresolved decisions or provisioning/runtime limitations, exact next action, and why it is next. Say explicitly when scope is incomplete. Do not claim a downstream skill ran unless it did.
