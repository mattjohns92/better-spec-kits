---
name: speckit-design
description: Design the UI/UX for the active Spec Kit feature before implementation planning.
---

# Spec Kit UI/UX Design

Perform the UI/UX design stage for the active Spec Kit feature.

This stage sits between specification/clarification and implementation planning:

specify → clarify → design → plan → tasks → implement

The purpose of this stage is to decide how users should interact with the feature before technical implementation decisions are made.

Do NOT implement application code during this stage.

## Inputs

Before designing anything:

1. Identify the active Spec Kit feature.
2. Read the feature's `spec.md`.
3. Read `.specify/memory/constitution.md`.
4. Inspect the existing user-facing application or interface, where one exists.
5. Inspect existing shared components, layouts, pages, forms, tables, dialogs, navigation patterns, responsive patterns, theme and styling.
6. Read and apply the installed UI UX Pro Max guidance where available.

## UI/UX Design Skill

For MINOR and SIGNIFICANT UI changes, use the installed UI UX Pro Max
skill/plugin as part of the design process when it is available in the current
Copilot environment.

Prefer invoking the installed skill/plugin through Copilot's skill/plugin
system rather than searching the repository for copied UI UX Pro Max files.

Do NOT require UI UX Pro Max to exist inside the current repository.

When UI UX Pro Max is available:

1. Use it to review the proposed interface and workflow.
2. Query it for guidance relevant to the specific feature rather than generic
   visual styling.
3. Use its recommendations to evaluate:
   - information hierarchy
   - interaction design
   - layout
   - responsive behaviour
   - forms
   - tables and data-heavy interfaces
   - navigation
   - accessibility
   - visual density
   - feedback and application states
4. Apply relevant recommendations when creating `design.md`.

UI UX Pro Max provides design expertise; it does NOT have authority over:

- the project constitution
- feature requirements
- established application patterns
- the existing design system
- existing reusable components

Do not blindly apply recommendations from the UI skill.

Recommendations MUST be evaluated against the existing application and the
user's workflow.

If UI UX Pro Max is not available in the current Copilot environment, continue
the design stage using the constitution and existing application patterns, and
explicitly report:

`UI UX Pro Max: NOT AVAILABLE`

If it is successfully used, report:

`UI UX Pro Max: USED`

The project constitution and feature specification take precedence over generic UI/UX recommendations.

## Step 1 — Determine UI Impact

Classify the feature:

### NONE

Use when the feature contains no meaningful user-facing interface change.

Examples:

- non-UI service or application changes
- API changes
- workers
- database changes
- parsers
- infrastructure
- internal refactoring

Do not create `design.md`.

Report:

`UI Impact: NONE`

Explain briefly why and recommend proceeding to `/speckit-plan`.

### MINOR

Use when the feature modifies an established interface pattern without introducing a meaningful new workflow.

Examples:

- adding a field to an existing form
- adding a column to an existing table
- adding a button using an established action pattern
- small copy or validation changes

Create a concise `design.md`.

Reuse existing application patterns.

Do not redesign the surrounding interface.

### SIGNIFICANT

Use when the feature introduces or materially changes:

- screens
- workflows
- navigation
- dashboards
- forms
- search/filter experiences
- tables with new interaction patterns
- mobile workflows
- complex dialogs/drawers
- multi-step interactions
- information architecture

Create a complete `design.md`.

## Step 2 — Understand the User Workflow

Design around the user's task, not the API, database schema or domain objects.

Identify:

- who is using the feature
- what they are trying to accomplish
- what information they need
- what decisions they need to make
- the most common workflow
- high-frequency actions
- occasional actions
- destructive or high-impact actions

Optimise frequent workflows for speed and clarity.

Reduce unnecessary:

- clicks
- taps
- navigation
- dialogs
- repeated data entry
- scrolling
- context switching

## Step 3 — Inspect Existing UI

Before proposing new UI, search the existing application for relevant patterns.

Identify reusable:

- page layouts
- headers
- navigation
- design-system primitives
- shared components or views
- forms and input patterns
- established form abstractions
- tables
- filters
- search controls
- dialogs
- drawers
- notifications
- loading states
- empty states
- error states
- responsive patterns
- typography
- spacing
- theme tokens

Record relevant findings in `design.md`.

Existing application patterns are the default.

Do NOT introduce a new pattern simply because another design may look better in isolation.

## Step 4 — Apply UI/UX Design Guidance

For MINOR or SIGNIFICANT UI impact, invoke the installed UI UX Pro Max
skill/plugin when available.

Use it to critically review the proposed user experience after inspecting the
existing application.

Ask it for guidance relevant to the actual feature and workflow.

Where applicable, seek guidance on:

- information hierarchy
- workflow efficiency
- layout
- responsive behaviour
- tables and dense data
- forms
- navigation
- interaction patterns
- accessibility
- application states
- visual density

Apply relevant guidance to `design.md`.

Do NOT use UI UX Pro Max to invent an unrelated visual language.

Existing application patterns are the starting point. UI UX Pro Max should
help improve those patterns where appropriate rather than replacing them
without justification.

Record in `design.md`:

### UI/UX Skill Review

**UI UX Pro Max:** USED | NOT AVAILABLE

If used, briefly record the material recommendations that influenced the
design.

If recommendations were deliberately rejected because they conflicted with
the existing application, constitution, or user workflow, record that where
the rejection materially affected the design.

## Step 5 — Design Responsive Behaviour

Desktop and mobile behaviour MUST be considered independently.

Do not define mobile as simply "stack the desktop layout".

Determine:

- information priority
- navigation changes
- action placement
- touch behaviour
- table behaviour
- form layout
- dialogs/drawers
- content density
- scrolling
- progressive disclosure

For tables and dense operational interfaces, explicitly define the mobile strategy.

## Step 6 — Define Application States

Consider all relevant states:

- initial loading
- background refreshing
- empty
- no search results
- partial data
- validation errors
- server errors
- permission errors
- offline/connectivity errors
- successful completion
- disabled actions

Only include states relevant to the feature.

## Step 7 — Accessibility

Consider:

- semantic controls
- labels
- keyboard navigation
- focus behaviour
- touch targets
- contrast
- icon labels
- screen-reader meaning
- alternatives to colour-only status

## Step 8 — Create design.md

For MINOR or SIGNIFICANT UI impact, create:

`<active-feature-directory>/design.md`

Use this structure:

# UI/UX Design: [Feature Name]

**UI Impact:** MINOR | SIGNIFICANT

## User Goal

Describe what the user is trying to accomplish.

## Existing Application Context

Document relevant existing screens, components and patterns inspected.

### Reuse

List existing components/patterns that should be reused.

### New UI Required

List genuinely new components or interaction patterns required.

## User Flow

Describe the primary workflow in order.

Include alternate flows only where meaningful.

## Information Hierarchy

Describe what information/actions have primary, secondary and supporting importance.

## Layout

### Desktop

Describe the intended desktop structure and behaviour.

### Mobile

Describe the intentional mobile structure and behaviour.

## Actions

### Primary Actions

List the most important actions.

### Secondary Actions

List supporting actions.

### Destructive / High-Impact Actions

Describe safeguards where applicable.

## Forms & Validation

Describe form organisation, defaults, validation and editing behaviour.

Omit if irrelevant.

## Data Display

Describe tables, lists, cards, charts or other data presentation.

Explain why the chosen presentation fits the workflow.

Omit if irrelevant.

## Application States

Define relevant loading, empty, error, success and disabled states.

## Accessibility

Record feature-specific accessibility requirements.

## Component Strategy

### Existing Components

List components to reuse.

### New Components

List new components that are justified.

New components should be reusable where appropriate.

## Design Decisions

Record significant UX decisions and why they were made.

Examples:

- inline editing instead of modal
- master/detail instead of separate pages
- drawer instead of dialog
- prioritised mobile list instead of horizontally scrolling table

## Open UX Questions

List unresolved design questions.

If unresolved questions materially affect implementation, recommend resolving them before `/speckit-plan`.

## Step 9 — Self Review

Before completing the design stage verify:

- the primary user task is obvious
- common actions are easy to reach
- existing patterns were reused where appropriate
- information hierarchy is clear
- unnecessary interactions were removed
- desktop behaviour is defined
- mobile behaviour is intentional
- relevant loading/empty/error/success states are covered
- accessibility was considered
- unnecessary cards, dialogs and containers were avoided
- the design is consistent with the constitution

Do not implement the feature.

Finish with:

- UI impact classification
- UI UX Pro Max: USED | NOT AVAILABLE
- design artifact created or skipped
- important UI/UX skill recommendations applied
- important design decisions
- unresolved UX questions
- readiness for `/speckit-plan`
