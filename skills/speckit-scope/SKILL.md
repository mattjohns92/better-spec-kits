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

### Optional Graphify Repository Discovery

Graphify is optional repository intelligence. Use it only when a relevant graph and query surface are already available and can materially reduce discovery. Treat graph output as a map, not proof: verify material conclusions against authoritative source. If Graphify or a useful graph/query surface is unavailable or unhelpful, continue with existing repository investigation.

Use graph results to locate current behavior, consumers, and existing patterns before classifying. Graph evidence does not establish requirement approval or broaden approved scope.

## Workflow

1. Inspect the project and relevant feature artifacts before asking questions the repository can answer. Keep inspection proportional. Distinguish observed facts from assumptions and user intent. If `specs/.scope/deferred-recommendations.md` exists, inspect only active entries that repository evidence makes relevant to this request. Present matches as unapproved recommendations and let the user choose whether to reconsider them; never auto-add or dump unrelated entries into the handoff.
2. Ask concise questions only for missing purpose, expected outcome, constraints, or boundaries that affect classification or decomposition. If material scope remains unresolved, report an incomplete result and write no artifact that implies a decision was made. Reassess after relevant evidence and each user answer; discovering a question does not permanently force FEATURE.
3. Classify by whether further specification and planning are likely to materially reduce uncertainty about the intended outcome or its important boundaries:
   - **BUG**: established behavior is failing or regressed.
   - **QUICK**: the intended outcome and material boundaries are understood, and additional Feature stages are unlikely to materially improve the definition, even when implementation needs careful work across paths or layers.
   - **FEATURE**: one coherent capability has a consequential outcome, boundary, or policy decision that remains unresolved and the normal Feature workflow would materially improve its definition.
   - **INITIATIVE**: evidence supports multiple coherent, independently specifiable outcomes with meaningful boundaries.
     For a mixed request, classify each item independently. Create one separate Q handoff for each qualifying QUICK item and recommend one Quick execution using the exact Q IDs. Keep Feature and Bug items on their existing routes; do not impose a fixed batch-size limit. Partition only when evidence shows the items cannot be safely understood or validated together.
4. Explain each classification using repository evidence and remaining uncertainty. For FEATURE, name the consequential unresolved definition and why further stages would help; for QUICK, state the established outcome/boundaries and why more specification is unlikely to improve them. Implementation effort or breadth alone must not require FEATURE. Do not use arbitrary size proxies such as file count, line count, or duration; technical difficulty alone does not make work an Initiative. Challenge unsupported assumptions and materially inappropriate boundaries.
5. Before any durable write or external handoff, redact credentials and other sensitive values with explicit markers. Preserve all remaining original request text verbatim and separately record Scope's interpretation. Never send unredacted content to Bug Assess.
6. Resolve existing records by exact typed ID. Ask rather than guess when an ID is missing, duplicated, or ambiguous.
7. Write only the record needed for the selected work shape, then report its ID, blockers, and one exact next action.

## Verification Depth

Verification depth is independent from specification ceremony. A QUICK outcome may still benefit from a lightweight, safe runtime check; a Feature does not automatically require browser execution. Classify by unresolved product-definition uncertainty, then describe runtime evidence proportionately to the changed behavior and available project/host capabilities.

## Records and Ownership

Allocate stable, non-reused IDs by inspecting existing records of the same type: `B###`, `Q###`, `F###`, and `I###`. Use three-digit numbering beginning at `001` and retain retired IDs as historical references.

- **BUG**: `specs/.scope/B###-<slug>.md`. Record reported behavior, known expected behavior, relevant evidence, boundaries, unresolved assessment questions, and sanitized original request. Report the actual upstream Bug provisioning state. Installation does not prove a fresh session can pass this ID to Assess. Only use the active integration's verified command when the B001 runtime gate in the feature task ledger is complete; otherwise retain the handoff and state that ID consumption is unverified.
- **QUICK**: `specs/.scope/Q###-<slug>.md`. Record the understood intended outcome, material boundaries, relevant evidence or established pattern, and validation target. Recommend `/speckit.quick Q###` only when that skill is available; never claim it ran.
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
