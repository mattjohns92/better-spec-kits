# Workflow

The recommended Better Spec Kit workflow is:

`specify → clarify → design → plan → tasks → implement → review`

Analyze remains available as an optional consistency check before implementation; it is not part of the recommended sequence.

## Design

Classifies UI impact as NONE, MINOR, or SIGNIFICANT. MINOR and SIGNIFICANT changes produce `design.md`. Significant work explores materially different approaches rather than merely restyling the first idea.

## Plan

Discovers the project's actual technology, architecture, conventions, dependencies, and relevant implementation before choosing an approach. Planning favours the smallest maintainable solution that preserves the approved specification and design.

## Tasks

Produces implementation-ready work while preferring reuse and extension over unnecessary new files, dependencies, abstractions, or infrastructure.

## Analyze (Optional)

Checks consistency between the specification, design, plan, and tasks before implementation. The upstream `/speckit.analyze` command remains available.

## Implement

Re-inspects relevant code before each task, preserves authoritative design decisions, implements the smallest maintainable change, and validates behavior. Independent acceptance review happens in the following Review stage.

## Review

Runs after implementation as an independent, read-only completion gate. It checks requirements and task coverage, design compliance, correctness and regression risk, test quality, and simplicity/reuse/maintainability. It reports evidence-backed findings or a clear completion outcome; it does not fix files.
