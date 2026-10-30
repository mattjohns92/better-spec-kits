---
name: speckit-design
description: Design the UI/UX for the active Spec Kit feature before implementation planning.
---

# Spec Kit UI/UX Design

Perform the UI/UX design stage for the active Spec Kit feature or UI Quick item.

For Features, this stage sits between specification/clarification and implementation planning:

specify → clarify → design → plan → tasks → implement

For a UI Quick, Design consumes the Scope-owned Q Brief and precedes Quick implementation; it does not require Feature specification or planning artifacts:

Scope → Q Brief → design/approval → Quick implementation

The purpose of this stage is to decide how users should interact with the feature before technical implementation decisions are made.

Do NOT implement application code during this stage.

## Inputs

Before designing anything:

1. Use an exact work-item identity supplied in the invocation before any conversation or repository context. Otherwise continue only one exact Feature or Quick item already selected in the current conversation; repository-level active feature metadata cannot establish or override session identity. If identity is missing or ambiguous, stop and ask before reading item artifacts. Do not select by title, recency, or partial ID.
2. For a Feature, read its `spec.md`. For a Quick, resolve exactly one new `specs/quick/Q###-<slug>/brief.md` or one legacy `specs/.scope/Q###-<slug>.md`, then read that authoritative Brief/handoff. Missing or duplicate Q records are ambiguous; stop and ask rather than guessing.
3. Read `.specify/memory/constitution.md`.
4. Inspect the existing user-facing application or interface, where one exists.
5. Inspect existing shared components, layouts, pages, forms, tables, dialogs, navigation patterns, responsive patterns, theme and styling.
6. Read and apply the installed UI UX Pro Max guidance where available.

The Q Brief is the approved outcome and boundary for Quick Design. Do not require a Feature `spec.md`, Plan, or Tasks to design a Q item. Design resolves presentation and interaction within the Brief; it does not change Scope classification or add product behavior.

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

Design may resolve interaction details within the approved outcome, but it
MUST NOT introduce material product behavior or broaden the user workflow
beyond the original request, explicit decisions, or necessary consequences.
Do not treat a requirement's presence in `spec.md` alone as proof that its
scope was approved. If a proposed design needs an unsupported material behavior,
stop and return it to Specify/Clarify rather than recording it as a settled
design decision.

### Optional Graphify Repository Discovery

Graphify is optional repository intelligence. Use it only when a relevant graph and query surface are already available and can materially reduce discovery. Treat graph output as a map, not proof: verify material conclusions against authoritative source. If Graphify or a useful graph/query surface is unavailable or unhelpful, continue with existing repository investigation.

For UI work, Graphify may locate existing pages and components; it does not select or approve a design direction.

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

Explain briefly why and recommend `/speckit-plan` for a Feature or Quick implementation for a Q item. Do not route a non-visual Q item into Feature planning.

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

### Visual Alternatives and User Selection

After approved product behavior and existing patterns are understood:

- For a routine change answered by an established pattern, reuse it without manufacturing alternatives or requiring ceremonial approval. Show the proposed result only when that materially improves understanding.
- For SIGNIFICANT work, decide explicitly whether the approved requirements and inspected product leave multiple credible, meaningfully different approaches. If they do and the choice can affect the user's experience, normally show **three rendered concepts** before selecting a direction. Show two when only two materially different approaches are credible; never invent an alternative to meet a count. One established pattern is enough only when repository evidence shows it is the clear fit or approved requirements leave no meaningful choice.
- Concepts must differ in meaningful structure or behavior, such as task flow, information hierarchy, density, navigation, progressive disclosure, or interaction model. A palette, spacing, radius, or icon variation is not a separate concept.
- Keep generated concepts and their supporting prototype/reference files under the active feature's `concepts/` directory for Feature work, or under `concepts/` in the Q item's folder for Quick work. Keep authoritative artifacts easy to identify at that item root. Follow the actual rendering mechanism's needs without adding unnecessary nested organization.
- Retain concept material that is useful evidence or a reference. Do not keep disposable generated/runtime output without a demonstrated need, and do not remove useful rejected or superseded concept evidence merely for tidiness.
- A concept is rendered only when the user can inspect actual visual output in the current session or an accessible artifact, such as a running prototype, rendered HTML, or screenshot. Prose, ASCII, Mermaid, a component list, or a `design.md` description is not rendered evidence. Keep concepts comparable in content and viewport where practical, label them A/B/C, and explain the decision each explores.
- Inspect current-session rendering tools first. Prefer the target application's technology and patterns or a lightweight disposable prototype. Do not add production dependencies, architecture, or infrastructure solely to render concepts.
- If rendering is unavailable or impractical, state the limitation and provide the strongest useful non-rendered representation, but do not claim that visual selection or approval occurred. Keep the material choice unresolved; ask whether the user accepts a non-rendered decision path or wants to defer. Do not describe Design as approved or ready for `/speckit-plan` while the choice is pending.
- Before presentation, critique and improve the concepts against the actual task, primary action, information hierarchy, interaction cost, product patterns, realistic content, responsive behavior, and accessibility. Remove generic or merely decorative options; do not mistake polish or a claimed skill invocation for usability.
- Label alternatives clearly and explain their differences in text as well as visually. The user may select, combine, revise, or reject concepts, request another direction, or combine aspects; incorporate the response and render a revision when useful.
- If a material choice is awaiting a response, remain paused. Do not treat silence as approval or describe the feature as ready for `/speckit-plan`.
- After the user responds, record the selected/current direction and links or paths to the concepts actually shown in `design.md`. Include rejected alternatives only when needed to prevent downstream drift.
- Make the current approved concept or direction and any approved refinement unambiguous in `design.md`. Rejected or superseded concepts remain supporting evidence only, not requirements or implementation targets. Do not record approval before the user responds to a material choice.
- If a visual direction requires a material product behavior that has not been approved, stop and return it to Clarify instead of deciding it in Design.

### Explicit Approval for UI Quick

For Quick UI work, explicit user approval of the current Design is always required before implementation, even when one established pattern is clear. Keep the design proportionate: confirm the established pattern and present the intended result without manufacturing alternatives. For meaningful alternatives, reuse the existing rendered concept/refinement flow and wait for approval of the latest direction. Do not begin Quick implementation before approval. Silence, Auto being enabled, or approval of a prior/superseded refinement is not approval of the current Design. Non-visual Quick work does not receive Design ceremony. This Quick-specific approval rule does not change existing Feature approval behavior.

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
design and the specific design decision each informed. A `USED` label alone
does not demonstrate contribution. If the skill was invoked but no relevant
recommendation changed or validated a decision, say so plainly; do not claim
that its presence proves design quality.

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

`<active-work-item-directory>/design.md`

For Quick work, the active work item directory is the exact Q folder containing `brief.md`.

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

Record the selected/current direction after the user responds, significant UX decisions, and why they were made. Keep this concise; include rejected alternatives only when needed to prevent downstream drift.

For SIGNIFICANT work with rendered alternatives, also record the concept labels, the visual artifact links/paths shown to the user, the meaningful distinction between them, and the user's selection or requested refinement. Do not record a selected direction or readiness for Plan before the user responds to a material choice.

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
- no material visual or interaction choice is still awaiting the user
- information hierarchy is clear
- unnecessary interactions were removed
- desktop behaviour is defined
- mobile behaviour is intentional
- relevant loading/empty/error/success states are covered
- accessibility was considered
- unnecessary cards, dialogs and containers were avoided
- the design is consistent with the constitution
- significant work with multiple credible approaches includes three rendered concepts by default (or two when only two are credible), with accessible visual evidence; a textual `design.md` is not a substitute
- each presented concept was critiqued for task fit and usability, and weak/generic concepts were revised before presentation
- any claimed UI UX Pro Max use is supported by a specific recommendation and its effect on a design decision

Do not implement the feature.

Finish with:

- UI impact classification
- UI UX Pro Max: USED | NOT AVAILABLE
- design artifact created or skipped
- important UI/UX skill recommendations applied
- important design decisions
- unresolved UX questions
- readiness for `/speckit-plan`

After successful design, state: `Next recommended step: /speckit-plan` and explain briefly that Plan turns the approved requirements and design into a technical approach. For `UI Impact: NONE`, do not create `design.md` and recommend Plan. If material UX questions remain unresolved, identify them and do not imply design is ready for planning.
