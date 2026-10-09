# Workflow

Better Spec Kit uses:

`specify → clarify → design → plan → tasks → analyze → implement`

## Design

Classifies UI impact as NONE, MINOR, or SIGNIFICANT. MINOR and SIGNIFICANT changes produce `design.md`. Significant work explores materially different approaches rather than merely restyling the first idea.

## Plan

Discovers the project's actual technology, architecture, conventions, dependencies, and relevant implementation before choosing an approach. Planning favours the smallest maintainable solution that preserves the approved specification and design.

## Tasks

Produces implementation-ready work while preferring reuse and extension over unnecessary new files, dependencies, abstractions, or infrastructure.

## Analyze

Remains the consistency gate between the specification, design, plan, and tasks. A Better Spec Kit-specific analyze enhancement is planned for a later release.

## Implement

Re-inspects relevant code before each task, preserves authoritative design decisions, implements the smallest maintainable change, validates behaviour, and performs a final simplicity/reuse review.
