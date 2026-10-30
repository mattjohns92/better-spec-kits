---
applyTo: "**"
---

# Shared-Source Ownership

Use this instruction only for work that is about to modify shared source or needs the shared tree to remain stable. Read-only inspection and verified writes to the selected item's own artifacts do not acquire source ownership.

## Resolve and Claim

- Resolve exactly one Feature or QUICK using the current invocation or selected conversation context. For a Feature, use the unique Scope brief's exact `feature_directory`. For a QUICK, use the exact Q ID and its unique authoritative Scope record. Never infer identity from repository membership, branch, title, recency, or `.specify/feature.json`.
- Immediately before the first source-changing action, run `node .github/hooks/speckit-source-ownership.mjs status` from the shared repository root, then claim the exact item with `claim --feature-dir <directory>` or `claim --quick-id <Q###>`.
- A successful claim returns one opaque token. Capture it only in the current shell's `BSK_SOURCE_OWNERSHIP_TOKEN` environment variable; do not pass it as a process argument. Keep it only in the current conversation/terminal context. Never write the token or its digest into a repository artifact, source file, task ledger, or report. Do not reveal it in the final response.
- A second claim is blocked even when it targets the same item. If the state is `HELD` by any item or `UNKNOWN`, do not modify source. Explain the reported owner or uncertainty and stop that source-changing path.
- Immediately before each later source-changing action, run `check` for the same exact item while `BSK_SOURCE_OWNERSHIP_TOKEN` is set in the current shell. A failed check blocks the edit.

## Retain, Release, and Recover

- Retain ownership while source changes are active, while validation or a decision requires a stable shared tree, or while a known finding/task requires source modification.
- Release with the matching item while `BSK_SOURCE_OWNERSHIP_TOKEN` is set in the current shell, at the first evidenced stable-source boundary where no known finding or remaining task requires source modification or a stable tree. Do not wait solely for Review PASS or overall Feature completion; external verification and non-source-changing acceptance may remain.
- After release, acquire a new claim immediately before any later source remediation. Preparation remains unclaimed only when it is verified not to modify shared source/runtime state and writes only the selected item's own artifacts.
- Never infer staleness from elapsed time or a closed conversation. Run `recover` only after the user explicitly inspects and accepts the current repository state. The explicit `--confirm-inspected` flag is required; recovery creates a new owner and does not imply implementation or Feature completion.
- Malformed, unsupported, unreadable, or operation-locked state is `UNKNOWN` and fails closed. Never remove a lock or overwrite a claim as routine cleanup. If safe recovery cannot be established, stop and report the limitation.

## Stage Boundaries

- Implement and Auto follow the claim/check/release lifecycle above. Auto must not bypass ownership when it reaches source-changing work.
- Review remains read-only. It may inspect ownership status and must disclose attribution ambiguity; it never changes source or releases another session's claim.
- Converge retains its existing upstream behavior and inputs. Do not claim that it consumes Git diff provenance or alter its responsibilities.
- This is cooperative protection for sessions sharing one local working tree. It does not prevent manual edits, external tools, non-cooperating sessions, or changes in separate/synchronized working trees. Do not claim supported-agent concurrency until the required two-session acceptance has actually run.