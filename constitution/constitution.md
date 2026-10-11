# Better Spec Kit Constitution

## Purpose

This constitution defines technology-neutral engineering principles for projects using Better Spec Kit. It deliberately does not prescribe languages, frameworks, databases, deployment platforms, repository layouts, or architectural styles.

Project-specific requirements and an adopted project constitution remain authoritative. Better Spec Kit MUST discover and work with the project that exists rather than forcing a preferred stack onto it.

## Core Principles

### I. Understand Before Changing

Existing behaviour MUST be understood before it is modified.

Before a meaningful change, inspect the relevant execution path and identify, where applicable:

- existing implementations of similar behaviour
- callers and consumers
- relevant modules, components, services, utilities, jobs, or processes
- public and internal contracts
- persistence interactions
- events and side effects
- tests
- external integrations

Search the codebase before introducing a new abstraction or parallel implementation. Existing architecture MUST be understood before proposing new architecture.

### II. Simple, Maintainable Solutions

Prefer the smallest clear solution that fully satisfies the requirement.

Abstractions MUST solve a demonstrated current problem, remove meaningful duplication, or provide a clear maintainability benefit. They MUST NOT be introduced for theoretical future reuse, architectural symmetry, or because an additional layer appears more sophisticated.

Code SHOULD optimise first for readability, cohesion, and maintainability. Simplicity MUST NOT be achieved by combining unrelated responsibilities, weakening validation or types, reducing testability, bypassing security, or creating oversized modules.

### III. Discover the Project; Do Not Prescribe the Stack

Better Spec Kit MUST NOT assume a programming language, framework, database, state-management approach, test framework, deployment platform, repository structure, or architectural pattern.

Before planning implementation, discover the project's established:

- technologies and dependencies
- architecture and module boundaries
- naming and file-placement conventions
- testing approach
- data and integration patterns
- UI design system and interaction patterns, where applicable
- build, validation, and deployment constraints relevant to the feature

Prefer established project conventions when they remain appropriate. A new pattern MUST have a concrete reason.

### IV. Reuse Before Creating

Before creating something new, determine whether the requirement can reasonably be satisfied by:

1. existing behaviour with no code change
2. extending the implementation that already owns the responsibility
3. reusing an existing project abstraction or dependency
4. using an existing platform or language capability
5. creating the smallest new implementation necessary

Functionality MUST NOT be duplicated merely because understanding the existing implementation is harder than starting again.

Conversely, unrelated responsibilities MUST NOT be forced into an existing module solely to reduce file count.

### V. Requirements and Scope Are Authoritative

Every meaningful change MUST trace to an approved requirement, bug, necessary refactor, test failure, design decision, or identified architectural issue within scope.

Do not implement speculative future requirements. Do not silently change public behaviour, business rules, contracts, defaults, persistence semantics, authorization behaviour, or material UX decisions during implementation.

When implementation discoveries require a material requirement or design change, update the authoritative artifact and record the reason before proceeding.

### VI. Contracts and Data Boundaries

Data crossing a system boundary MUST be treated as a contract. Examples include APIs, persisted records, events, messages, files, configuration, command interfaces, and external integration payloads.

Before changing an existing contract, identify known producers and consumers. Breaking changes require an explicit migration, versioning, or compatibility strategy.

External, persisted, or otherwise untrusted data MUST be validated at an appropriate boundary. Validation MUST NOT be weakened merely to accept unexpected data.

### VII. Persistence and Migration Safety

Persisted state may outlive the code that created it. Changes to persisted structures MUST consider existing data, missing or legacy values, indexes or equivalent access structures, migration requirements, rollback implications, and production scale.

Production data MUST NOT be silently discarded, rewritten, or reinterpreted simply because doing so simplifies implementation.

### VIII. Testing for Behaviour

Meaningful behaviour and business logic MUST be tested using the project's established testing tools and conventions.

Inspect relevant existing tests before changing behaviour. Add or update tests alongside meaningful logic changes. Tests SHOULD validate outcomes rather than incidental implementation details and SHOULD be deterministic.

A valid test MUST NOT be removed, weakened, or skipped merely because a new implementation fails it. Bugs SHOULD receive regression tests where practical.

Testing strategy MUST be appropriate to the technology and risk; Better Spec Kit MUST NOT prescribe a specific testing framework or test type where the project does not justify it.

### IX. Errors and Observability

Failures MUST be explicit and diagnosable. Errors MUST NOT be silently swallowed or converted into successful outcomes.

Handle errors where meaningful context, recovery, translation, or user feedback can be added. Important operations SHOULD expose enough information to determine whether work succeeded, failed, was retried, or remains pending.

Logs and diagnostics MUST NOT expose secrets or sensitive credentials.

### X. Security by Default

Security is part of implementation, not a later hardening phase.

Sensitive operations MUST validate and authorize inputs at a trusted boundary appropriate to the system. User-controlled and external input MUST be treated as untrusted. Secrets and credentials MUST NOT be committed to source control or exposed to untrusted clients.

Security controls MUST NOT be weakened merely to simplify development or make a test pass.

### XI. Performance and Bounded Work

Implementation MUST consider expected production scale and execution frequency, not only development fixtures.

Avoid obviously unbounded, multiplicative, or unnecessarily repeated work. Use batching, pagination, streaming, indexing, caching, bounded queries, or equivalent techniques when justified by the project's technology and workload.

Optimisation SHOULD be evidence-driven. Performance improvements MUST NOT sacrifice correctness or maintainability for negligible gains.

### XII. Refactoring and Cleanup

Refactoring is part of implementation when directly required by the change.

When new work supersedes existing code, remove obsolete code, imports, files, duplicate logic, and temporary migration paths where safe and within scope.

Do not retain old and new implementations in parallel without an explicit compatibility requirement. Do not expand a feature into unrelated repository-wide cleanup.

### XIII. Documentation Near the Decision

Prefer descriptive naming, cohesive boundaries, explicit contracts, and focused tests over excessive explanatory prose.

Comments SHOULD explain why a non-obvious decision or constraint exists rather than restating what the code does.

Standalone documentation is appropriate for information that genuinely spans implementation boundaries, such as setup, deployment, operations, architecture, external contracts, or recovery procedures. Do not create documentation merely to narrate completed work.

### XIV. Intentional Product and UI/UX Design

User-facing features MUST be designed around the user's task rather than the shape of underlying data or APIs.

Features with meaningful UI impact MUST pass through the Better Spec Kit design stage before implementation planning. The design stage MUST classify UI impact as NONE, MINOR, or SIGNIFICANT and create `design.md` where required.

For user-facing work, consider:

- user goals and workflow
- information hierarchy
- primary, secondary, and destructive actions
- interaction cost and unnecessary steps
- loading, empty, error, success, disabled, and validation states
- responsive behaviour where relevant
- keyboard, touch, assistive technology, and accessibility where relevant
- the project's existing design system and reusable UI primitives

Existing design-system primitives SHOULD be reused where they support the selected experience. Existing page-level UX patterns are context, not automatically the best solution. Significant features SHOULD challenge poor legacy workflows when a materially clearer experience can be delivered without violating project requirements or constraints.

Do not introduce visual complexity merely to make an interface appear designed.

### XV. Implementation Discipline

Before each implementation task, inspect the relevant existing code and confirm the planned change still fits what is actually present.

Do not introduce unnecessary wrappers, adapters, services, utilities, configuration, dependencies, compatibility layers, or architectural layers. New dependencies require a demonstrated need that existing project capabilities cannot reasonably satisfy.

Fix underlying causes rather than masking symptoms where practical. Do not weaken validation, error handling, authorization, type safety, tests, accessibility, or required behaviour to make implementation easier.

### XVI. Completion Requires Validation

A feature is complete only when:

- approved requirements are implemented
- applicable design decisions are preserved
- required tests and project validation checks pass
- material contracts and migrations are handled safely
- implementation does not contain avoidable duplication or speculative complexity
- relevant user-facing states and accessibility requirements are handled
- obsolete implementation introduced or superseded by the feature has been cleaned up where safe

For user-facing features, technically correct behaviour is insufficient when the resulting workflow materially fails the approved design.

## Better Spec Kit Workflow

The recommended workflow is:

`specify → clarify → design → plan → tasks → analyze → implement → converge → review`

Analyze is the normal, proportionate final pre-implementation gate. It checks artifact coherence and challenges material decisions before implementation; it records findings in feature-local `analysis.md` and does not modify upstream artifacts or implement remediation. When blocking findings remain, address them through the routed upstream stage and rerun Analyze before implementation normally proceeds. GitHub Spec Kit owns Converge. When it identifies remaining work, repeat `converge → implement → converge` until convergence is achieved, then proceed to Review.

`design` is the authoritative UI/UX design stage. `plan`, `tasks`, `analyze`, `implement`, `converge`, and `review` MUST preserve material decisions from `design.md` when it exists.

Optional external skills may provide specialist guidance, but they MUST NOT override the project constitution, approved requirements, authoritative design decisions, or discovered project constraints.

## Governance

This constitution is a neutral baseline, not a substitute for project-specific rules.

A project MAY extend or replace this constitution with stricter project-specific standards. Where a project constitution exists, it is authoritative for that project.

Changes to these principles SHOULD remain technology-neutral unless Better Spec Kit intentionally introduces an optional, clearly separated integration.

**Version**: 0.1.0
