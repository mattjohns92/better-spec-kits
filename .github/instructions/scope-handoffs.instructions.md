---
applyTo: "**"
---

# Better Spec Kit Scope Handoffs

Apply these instructions only when the entire argument supplied to an existing Specify or Bug Assess workflow is one Scope ID matching `F` followed by digits or `B` followed by digits. For any other input, leave the existing workflow unchanged.

Scope records use YAML front matter with an exact `id` field. Resolve the ID by exact match; never select by title, recency, or partial text. If there is no matching record or more than one match, stop and ask the user to identify the intended record. Do not guess or create a new feature from the ID text.

For an `F###` ID:

1. Find the unique matching `brief.md` under a normal numbered `specs/` feature directory and verify its front-matter `id`.
2. Read the brief, its parent Initiative when present, and its referenced dependencies/completed feature artifacts where applicable.
3. Use the brief's `feature_directory` value as the exact `SPECIFY_FEATURE_DIRECTORY`; do not allocate another directory from the branch name or sequence.
4. Treat the brief as durable intent, not a complete specification. Inspect current project behavior, preserve the intended outcome, reconcile stale assumptions, and continue the normal upstream Specify workflow. Do not change Scope-owned Initiative structure.

For a `B###` ID:

1. Find the unique matching sanitized Bug Handoff under `specs/.scope/` and verify its front-matter `id`.
2. Confirm the upstream Bug extension is installed and resolve its Assess command for the active agent integration. If unavailable, report that limitation and do not claim the assessment ran.
3. Use the sanitized handoff as the report input to the existing Bug Assess workflow. Do not copy unsanitized content, modify the handoff, or duplicate Bug assessment behavior.

Never modify Scope-owned records or Initiative decomposition from Specify or Bug Assess. Do not claim a downstream command ran unless it actually ran.

## Boundary Changes

If current evidence shows that a handoff's intended outcome or boundary is materially wrong, stop the affected receiver path. Preserve the evidence and return the decision to Scope; do not silently change Scope-owned Initiative structure or Feature Brief boundaries. Unrelated work remains available.