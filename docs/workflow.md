# Workflow

The recommended Better Spec Kit workflow is:

`specify → clarify → design → plan → tasks → implement → converge → review`

Analyze remains available as an optional consistency check before implementation; it is not part of the recommended sequence.

## Design

Classifies UI impact as NONE, MINOR, or SIGNIFICANT. MINOR and SIGNIFICANT changes produce `design.md`. Significant work explores materially different approaches rather than merely restyling the first idea.

## Plan

Discovers the project's actual technology, architecture, conventions, dependencies, and relevant implementation before choosing an approach. Planning favours the smallest maintainable solution that preserves the approved specification and design.

## Tasks

Creates the original implementation plan in the feature's `tasks.md` while preferring reuse and extension over unnecessary new files, dependencies, abstractions, or infrastructure. That file remains the single implementation work ledger: upstream Converge may append missing completeness work, Implement may append Review-remediation tasks under `## Review Remediation`, and Review reads the ledger without modifying it. Review findings remain in `review.md` and are never replaced by task status.

## Analyze (Optional)

Checks consistency between the specification, design, plan, and tasks before implementation. The upstream `/speckit.analyze` command remains available.

## Implement

Re-inspects relevant code before each task, preserves authoritative design decisions, implements the smallest maintainable change, and validates behavior.

## Converge (Upstream)

GitHub Spec Kit owns `/speckit.converge`; Better Spec Kit does not duplicate, bundle, or replace it. Run Converge after implementation. If it appends remaining tasks, repeat `converge → implement → converge` until no work remains. If Converge is unavailable, follow the [official GitHub Spec Kit installation and update instructions](https://github.com/github/spec-kit); do not install an unverified replacement.

## Review

Runs after convergence as an independent, read-only implementation-quality gate. It assesses correctness and regression risk, applicable design compliance, test quality, and simplicity/reuse/maintainability. It uses current Converge evidence without repeating exhaustive completeness analysis, but checks relevant requirements when evidence is missing or contradicted. It creates or updates a durable `review.md` artifact in the active feature directory, records blocking and non-blocking findings with stable IDs, and keeps a concise resolved-history without merging findings into `tasks.md`. It reports evidence-backed findings and a clear completion outcome; it does not fix files and it remains the only authority for changing a finding from `OPEN` to `RESOLVED`. Task completion alone does not resolve findings. After remediation, the expected sequence is `implement -> converge -> review`.
