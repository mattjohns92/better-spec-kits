---
applyTo: "**"
---

# Work Item Identity

Apply this guidance whenever a workflow stage reads or writes Feature or QUICK artifacts. Keep identity in the explicit invocation or current conversation; do not treat repository membership as a selected item.

## Resolve One Exact Item

- An exact work-item identity supplied in the current invocation takes precedence over conversation context and repository metadata. Otherwise continue only one unambiguous item already selected in the current conversation.
- For a Feature, resolve the exact `F###` to one Scope Feature Brief and verify its `feature_directory` and artifact paths agree. For a QUICK, resolve the exact `Q###` to one new Q Brief or one legacy Q handoff; associate supplemental artifacts only by exact Q ID and slug.
- If identity is missing, duplicated, unsupported, or inconsistent with the recorded path, ask for clarification before reading or mutating uncertain item artifacts.
- Never select by title, partial ID, newest/highest identifier, directory order, branch name, dirty working-tree contents, or unrelated artifacts.
- Do not allow `.specify/feature.json` to override an explicit invocation or the selected item's current-conversation context. It is repository-wide upstream helper state, not session identity.

## Pass Feature Context to Helpers

Before invoking an upstream Spec Kit helper that resolves Feature paths, provide the selected Feature directory as `SPECIFY_FEATURE_DIRECTORY` for that helper invocation. Keep the environment override scoped to that invocation and restore any previous value afterward; do not leave a selected directory in a shared persistent terminal environment. Use `-PathsOnly` for path-only PowerShell resolution where supported. Setup calls that create artifacts may update `.specify/feature.json`; continue passing the exact selected directory to later stages rather than relying on that shared pointer.

QUICK stages use the exact Q record and its Q-local paths. Do not send a Q identity through Feature path helpers or create Feature artifacts solely to represent QUICK work.

## Preserve Artifact Ownership

Read shared repository evidence when relevant, but write only artifacts owned by the selected item and current stage. Do not serialize preparation of distinct work-item IDs solely because they share a repository. Identity does not make concurrent writes to the same item's artifacts safe. This instruction does not authorize shared-source implementation, lifecycle coordination, or changes to another item's scope or findings.
